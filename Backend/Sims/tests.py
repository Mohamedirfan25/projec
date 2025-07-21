from django.test import TestCase, override_settings, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from .models import Temp, Document
from django.contrib.auth.models import User
import os

@override_settings(MEDIA_ROOT=os.path.join(settings.BASE_DIR, 'test_media'))
class DocumentUploadPathTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.temp = Temp.objects.create(user=self.user, emp_id='EMP123', role='intern')
        self.client = Client()
        self.client.login(username='testuser', password='testpass')

    def tearDown(self):
        # Clean up test files
        import shutil
        test_media = os.path.join(settings.BASE_DIR, 'test_media')
        if os.path.exists(test_media):
            shutil.rmtree(test_media)

    def test_document_upload_path(self):
        test_file = SimpleUploadedFile('testdoc.pdf', b'my file content', content_type='application/pdf')
        doc = Document.objects.create(
            title='Test Doc',
            description='Test Description',
            uploader=self.temp,
            file=test_file
        )
        expected_path = f'documents/expecting/{self.temp.emp_id}/testdoc.pdf'
        self.assertTrue(expected_path in doc.file.name)
        # Also check file physically exists
        self.assertTrue(os.path.exists(doc.file.path))

    def test_document_upload_api(self):
        url = '/documents/'
        test_file = SimpleUploadedFile('testdoc_api.pdf', b'api file content', content_type='application/pdf')
        data = {
            'title': 'API Doc',
            'description': 'Uploaded via API',
            'files': [test_file],
        }
        self.client.force_login(self.user)
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, 201)
        # Find the document
        doc = Document.objects.filter(title='API Doc').first()
        self.assertIsNotNone(doc)
        expected_path = f'documents/expecting/{self.temp.emp_id}/testdoc_api.pdf'
        self.assertTrue(expected_path in doc.file.name)
        self.assertTrue(os.path.exists(doc.file.path))
