import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME ?? "";
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY ?? "";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? "";
const sasTtlSeconds = parseInt(process.env.AZURE_SAS_TTL_SECONDS ?? "3600", 10);

if (!accountName || !accountKey || !containerName) {
  console.warn(
    "[azureStorage] Missing Azure credentials. Document upload will fail at runtime."
  );
}

const credential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential
);

export interface AzureStorageService {
  uploadBlob(buffer: Buffer, blobName: string, contentType: string): Promise<void>;
  generateSasUrl(blobName: string, ttlSeconds: number): Promise<string>;
}

export const azureStorage: AzureStorageService = {
  async uploadBlob(buffer: Buffer, blobName: string, contentType: string): Promise<void> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
  },

  async generateSasUrl(blobName: string, ttlSeconds: number = sasTtlSeconds): Promise<string> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    containerClient.getBlobClient(blobName);

    const expiresOn = new Date();
    expiresOn.setSeconds(expiresOn.getSeconds() + ttlSeconds);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        expiresOn,
      },
      credential
    ).toString();

    const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
    return `${blobUrl}?${sasToken}`;
  },
};
