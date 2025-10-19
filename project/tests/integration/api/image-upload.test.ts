import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { unlink, readdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const API_URL = 'http://localhost:3000/api/admin/image/upload'
const TEST_API_KEY = 'test-api-key-12345'
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

// Set environment variable for tests
process.env.POSTS_UPLOAD_API_KEY = TEST_API_KEY

// Helper to create a test image file
function createTestImageFile(
  name: string,
  type: string = 'image/png',
  sizeKB: number = 10
): File {
  const buffer = Buffer.alloc(sizeKB * 1024)
  const blob = new Blob([buffer], { type })
  return new File([blob], name, { type })
}

// Helper to clean up uploaded test images
async function cleanupTestImages() {
  if (!existsSync(IMAGES_DIR)) return

  const files = await readdir(IMAGES_DIR)
  const testFiles = files.filter(
    (f) => f.startsWith('test-') || f.startsWith('image-')
  )

  for (const file of testFiles) {
    try {
      await unlink(path.join(IMAGES_DIR, file))
    } catch (error) {
      // Ignore errors
    }
  }
}

describe('POST /api/admin/image/upload', () => {
  beforeEach(async () => {
    await cleanupTestImages()
  })

  afterEach(async () => {
    await cleanupTestImages()
  })

  describe('Authentication', () => {
    it('should return 401 without API key', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 401 with invalid API key', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': 'invalid-key' },
        body: formData,
      })

      expect(response.status).toBe(401)
    })

    it('should accept request with valid API key', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
    })
  })

  describe('File Validation', () => {
    it('should return 400 when no file is provided', async () => {
      const formData = new FormData()

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Bad request')
      expect(data.message).toContain('No image file')
    })

    it('should accept PNG images', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png', 'image/png'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
    })

    it('should accept JPEG images', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.jpg', 'image/jpeg'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
    })

    it('should accept GIF images', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.gif', 'image/gif'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
    })

    it('should accept WebP images', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.webp', 'image/webp'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
    })

    it('should accept SVG images', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.svg', 'image/svg+xml'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
    })

    it('should reject non-image files', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.pdf', 'application/pdf'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid file type')
    })

    it('should reject files larger than 5MB', async () => {
      const formData = new FormData()
      // Create 6MB file
      formData.append('image', createTestImageFile('large.png', 'image/png', 6 * 1024))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('File too large')
      expect(data.message).toContain('5MB')
    })

    it('should accept files at max size limit', async () => {
      const formData = new FormData()
      // Create exactly 5MB file
      formData.append('image', createTestImageFile('max.png', 'image/png', 5 * 1024))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
    })
  })

  describe('File Upload Without Custom Name', () => {
    it('should upload image with auto-generated name', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.filename).toMatch(/^image-\d+-[a-z0-9]+\.png$/)
      expect(data.url).toBe(`/images/${data.filename}`)
    })

    it('should create file in public/images directory', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      const data = await response.json()
      const filepath = path.join(IMAGES_DIR, data.filename)
      expect(existsSync(filepath)).toBe(true)
    })

    it('should return file metadata', async () => {
      const formData = new FormData()
      const file = createTestImageFile('test.png', 'image/png', 50)
      formData.append('image', file)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      const data = await response.json()
      expect(data.size).toBe(file.size)
      expect(data.sizeFormatted).toContain('KB')
      expect(data.type).toBe('image/png')
    })
  })

  describe('File Upload With Custom Name', () => {
    it('should upload image with custom name', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('original.png'))
      formData.append('name', 'test-custom-image')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.filename).toBe('test-custom-image.png')
      expect(data.url).toBe('/images/test-custom-image.png')
    })

    it('should preserve correct extension from file type', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.jpg', 'image/jpeg'))
      formData.append('name', 'my-photo')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      const data = await response.json()
      expect(data.filename).toBe('my-photo.jpg')
    })

    it('should sanitize custom name with special characters', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))
      formData.append('name', 'My Image @#$% Name!')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      const data = await response.json()
      expect(data.filename).toBe('my-image-name.png')
    })

    it('should sanitize custom name with spaces', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))
      formData.append('name', 'my awesome image')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      const data = await response.json()
      expect(data.filename).toBe('my-awesome-image.png')
    })

    it('should convert custom name to lowercase', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))
      formData.append('name', 'MyImageName')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      const data = await response.json()
      expect(data.filename).toBe('myimagename.png')
    })

    it('should return 400 for invalid custom name', async () => {
      const formData = new FormData()
      formData.append('image', createTestImageFile('test.png'))
      formData.append('name', '@#$%^&*()')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData,
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid name')
    })

    it('should return 400 if file with custom name already exists', async () => {
      const formData1 = new FormData()
      formData1.append('image', createTestImageFile('test1.png'))
      formData1.append('name', 'test-duplicate')

      // Upload first file
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData1,
      })

      // Try to upload second file with same name
      const formData2 = new FormData()
      formData2.append('image', createTestImageFile('test2.png'))
      formData2.append('name', 'test-duplicate')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': TEST_API_KEY },
        body: formData2,
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('File exists')
    })
  })

  describe('GET /api/admin/image/upload', () => {
    it('should return endpoint information', async () => {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.endpoint).toBe('/api/admin/image/upload')
      expect(data.method).toBe('POST')
      expect(data.allowedTypes).toBeDefined()
      expect(data.maxSize).toBe('5MB')
    })

    it('should require authentication', async () => {
      const response = await fetch(API_URL, {
        method: 'GET',
      })

      expect(response.status).toBe(401)
    })
  })

  describe('Method Not Allowed', () => {
    it('should return 405 for PUT requests', async () => {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(405)
    })

    it('should return 405 for DELETE requests', async () => {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(405)
    })

    it('should return 405 for PATCH requests', async () => {
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: { 'x-api-key': TEST_API_KEY },
      })

      expect(response.status).toBe(405)
    })
  })
})
