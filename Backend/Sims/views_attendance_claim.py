from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from .models import AttendanceClaim, Temp
from .serializers import AttendanceClaimSerializer
from .permissions import IsAdmin, IsStaff

class AttendanceClaimViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing attendance claims.
    """
    serializer_class = AttendanceClaimSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return attendance claims for the current user.
        Staff users can see all claims, regular users only see their own.
        """
        user = self.request.user
        queryset = AttendanceClaim.objects.all()
        
        # If not staff, only return user's own claims
        if not (user.is_staff or user.is_superuser):
            queryset = queryset.filter(user=user)
            
        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param.upper())
            
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(from_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(to_date__lte=end_date)
            
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Set the user to the current user when creating a claim."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an attendance claim (staff only)."""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        claim = self.get_object()
        
        if claim.status == 'APPROVED':
            return Response(
                {"detail": "This claim has already been approved."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        claim.status = 'APPROVED'
        claim.reviewed_by = request.user
        claim.updated_at = timezone.now()
        claim.save()
        
        # TODO: Add logic to update attendance records here
        
        return Response(
            {"detail": "Claim approved successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an attendance claim (staff only)."""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        claim = self.get_object()
        rejection_reason = request.data.get('rejection_reason', '')
        
        if not rejection_reason:
            return Response(
                {"detail": "Rejection reason is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if claim.status == 'REJECTED':
            return Response(
                {"detail": "This claim has already been rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        claim.status = 'REJECTED'
        claim.reviewed_by = request.user
        claim.rejection_reason = rejection_reason
        claim.updated_at = timezone.now()
        claim.save()
        
        return Response(
            {"detail": "Claim rejected successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def my_claims(self, request):
        """Get the current user's claims."""
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.filter(user=request.user)
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get claims pending approval (staff only)."""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "You do not have permission to view this."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.filter(status='PENDING')
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
