import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'unautorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'no file provided' }, { status: 400 })
        }

        const fileExtension = file.name.split('.').pop()
        const fileName = `bot-avatars/${userId}-${Date.now()}.${fileExtension}`

        const buffer = Buffer.from(await file.arrayBuffer())

        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: fileName,
            Body: buffer,
            ContentType: file.type
        })

        await s3Client.send(uploadCommand)

        const storageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`

        let previewUrl = storageUrl

        try {
            previewUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME!,
                    Key: fileName
                }),
                { expiresIn: 3600 }
            )
        } catch (error) {
            console.error('failed to create bot avatar preview url:', error)
        }

        return NextResponse.json({
            success: true,
            url: storageUrl,
            previewUrl
        })

    } catch (error) {
        console.error('s3 uplaod error:', error)
        return NextResponse.json({ error: 'failed to upload image' }, { status: 500 })
    }
}