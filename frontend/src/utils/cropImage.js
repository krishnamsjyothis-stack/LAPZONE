const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));

    image.src = url;
  });

const cropImage = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  canvas.width = 1200;
  canvas.height = 900;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    1200,
    900
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create cropped image"));
          return;
        }

        const file = new File(
          [blob],
          `product-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        resolve(file);
      },
      "image/jpeg",
      0.9
    );
  });
};

export default cropImage;