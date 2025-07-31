# In views_attendance_claim.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from .models import AttendanceClaim, Temp, UserData
from .serializers import AttendanceClaimSerializer
from django.db import transaction

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class AttendanceClaimViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceClaimSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Return queryset based on role and optional status filter, mirroring leave logic."""
        user = self.request.user
        base_qs = AttendanceClaim.objects.all().order_by('-created_at')

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param:
            base_qs = base_qs.filter(status__iexact=status_param.upper())

        try:
            temp = Temp.objects.get(user=user)
        except Temp.DoesNotExist:
            return AttendanceClaim.objects.none()

        role = temp.role.lower()
        
        # Admin -> all
        if role == 'admin':
            return base_qs
        # Staff -> only interns in same department
        if role == 'staff':
            try:
                staff_dept = UserData.objects.get(user=user,is_deleted=False).department
                interns_in_dept = UserData.objects.filter(department=staff_dept, emp_id__role='intern', is_deleted=False).values_list('user', flat=True)
                return base_qs.filter(user__in=interns_in_dept)
            except UserData.DoesNotExist:
                return AttendanceClaim.objects.none()
        # Intern -> own
        return base_qs.filter(user=user)
        user = self.request.user
        queryset = AttendanceClaim.objects.all().order_by('-created_at')
        
        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status__iexact=status_param.upper())
            
        # Non-staff users can only see their own claims
        if not user.is_staff:
            queryset = queryset.filter(user=user)
            
        return queryset

    @action(detail=False, methods=['get'])
    def my_claims(self, request):
        """Return claims of the logged-in user (intern dashboard)."""
        qs = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(self.get_serializer(qs, many=True).data)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Prevent duplicate claims for same date range
        existing_claim = AttendanceClaim.objects.filter(
            user=request.user,
            from_date__lte=request.data.get('to_date'),
            to_date__gte=request.data.get('from_date'),
            status__in=['PENDING', 'APPROVED']
        ).exists()
        
        if existing_claim:
            return Response(
                {'detail': 'You already have a pending or approved claim for this date range.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        claim = self.get_object()
        
        if claim.status == 'APPROVED':
            return Response(
                {'detail': 'This claim has already been approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        claim.status = 'APPROVED'
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.save()
        
        # TODO: Update attendance records here
        # update_attendance_records(claim)
        
        # TODO: Send notification to user
        # send_notification(claim.user, 'Your attendance claim has been approved')
        
        return Response({'detail': 'Claim approved successfully.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        claim = self.get_object()
        rejection_reason = request.data.get('rejection_reason', '').strip()
        
        if not rejection_reason:
            return Response(
                {'detail': 'Rejection reason is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if claim.status == 'REJECTED':
            return Response(
                {'detail': 'This claim has already been rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        claim.status = 'REJECTED'
        claim.reviewed_by = request.user
        claim.rejection_reason = rejection_reason
        claim.reviewed_at = timezone.now()
        claim.save()
        
        # TODO: Send notification to user
        # send_notification(claim.user, f'Your attendance claim has been rejected. Reason: {rejection_reason}')
        
        return Response({'detail': 'Claim rejected successfully.'})

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        queryset = self.get_queryset().filter(status='PENDING')
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)