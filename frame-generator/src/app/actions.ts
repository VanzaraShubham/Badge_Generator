'use server';

export async function uploadImage(base64Data: string): Promise<string> {
  try {
    // Remove the data:image/png;base64, prefix
    const base64 = base64Data.split(',')[1];
    if (!base64) throw new Error('Invalid base64 data');

    // Use FreeImage.host API with their public key. 
    // This uses application/x-www-form-urlencoded which works perfectly in Node.js Server Actions
    // (unlike multipart/form-data which can sometimes fail with Blobs in Next.js).
    const API_KEY = '6d207e02198a847aa98d0a2a901485a5';
    
    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', 'upload');
    params.append('source', base64);
    params.append('format', 'json');

    const response = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Image upload failed:', text);
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.image && data.image.url) {
      return data.image.url;
    }
    
    throw new Error('Invalid response from image host');
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw new Error('Failed to generate share link');
  }
}

