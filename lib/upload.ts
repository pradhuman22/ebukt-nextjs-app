"use server";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3Client";
import { v4 as uuidv4 } from "uuid";

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string
) {
  const bucketName = process.env.AWS_BUCKET_NAME_S3;
  const key = `${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60,
  });
  return { signedUrl, key };
}

export async function deleteImage(key: string) {
  if (!key) return;
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME_S3,
    Key: key,
  });
  await s3Client.send(command);
  return { success: true };
}
