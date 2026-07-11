import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  public_id: string
  width?: number
  height?: number
  format: string
  size: number
}

export async function uploadFile(
  file: string | Buffer,
  folder: string,
  options?: {
    width?: number
    height?: number
    crop?: string
    quality?: number
    format?: string
  }
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:application/octet-stream;base64,${file.toString('base64')}`,
    {
      folder: `nolance/${folder}`,
      transformation: options ? [{
        width: options.width,
        height: options.height,
        crop: options.crop || 'limit',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
      }] : undefined,
    }
  )

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    size: result.bytes,
  }
}

export async function uploadProfilePhoto(file: string | Buffer): Promise<UploadResult> {
  return uploadFile(file, 'profiles', { width: 400, height: 400, crop: 'fill' })
}

export async function uploadGigImage(file: string | Buffer): Promise<UploadResult> {
  return uploadFile(file, 'gigs', { width: 712, height: 430, crop: 'fill', quality: 85 })
}

export async function uploadGigVideo(file: string | Buffer): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:video/mp4;base64,${file.toString('base64')}`,
    {
      folder: 'nolance/gig-videos',
      resource_type: 'video',
      transformation: [{ duration: '75', quality: 'auto' }],
    }
  )
  return { url: result.secure_url, public_id: result.public_id, format: result.format, size: result.bytes }
}

export async function uploadDeliveryFile(file: string | Buffer, filename: string): Promise<UploadResult> {
  return uploadFile(file, 'deliveries')
}

export async function uploadBusinessLogo(file: string | Buffer): Promise<UploadResult> {
  return uploadFile(file, 'businesses', { width: 400, height: 400, crop: 'fill' })
}

export async function uploadPortfolioSample(file: string | Buffer): Promise<UploadResult> {
  return uploadFile(file, 'portfolio', { width: 800, height: 600, crop: 'limit' })
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export async function generateUploadSignature(folder: string): Promise<{ signature: string; timestamp: number; cloudName: string; apiKey: string }> {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: `nolance/${folder}` },
    process.env.CLOUDINARY_API_SECRET!
  )
  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  }
}
