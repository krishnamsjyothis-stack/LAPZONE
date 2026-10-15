import Offer from "../models/Offer.js";

export const getBestOffer = async (product) => {
  try {
    const now = new Date();

    // Find active product offers
    const productOffers = await Offer.find({
      offerType: "PRODUCT",
      productId: product._id,
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
    });

    // Find active category offers
    const categoryOffers = await Offer.find({
      offerType: "CATEGORY",
      category: product.category,
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
    });

    const offers = [...productOffers, ...categoryOffers];

    // No offer
    if (offers.length === 0) {
      return {
        hasOffer: false,
        originalPrice: product.price,
        discountAmount: 0,
        finalPrice: product.price,
        offer: null,
      };
    }

    let bestOffer = null;
    let highestDiscount = 0;

    // Check every offer
    for (const offer of offers) {
      let discountAmount = 0;

      if (offer.discountType === "PERCENTAGE") {
        discountAmount =
          (product.price * offer.discountValue) / 100;
      }

      if (offer.discountType === "FIXED") {
        discountAmount = offer.discountValue;
      }

      // Don't allow price to become negative
      discountAmount = Math.min(
        discountAmount,
        product.price
      );

      // Choose the biggest actual discount
      if (discountAmount > highestDiscount) {
        highestDiscount = discountAmount;
        bestOffer = offer;
      }
    }

    const finalPrice = product.price - highestDiscount;

    return {
      hasOffer: true,
      originalPrice: product.price,
      discountAmount: Math.round(highestDiscount),
      finalPrice: Math.round(finalPrice),
      offer: bestOffer,
    };
  } catch (error) {
    console.error("Get best offer error:", error);

    return {
      hasOffer: false,
      originalPrice: product.price,
      discountAmount: 0,
      finalPrice: product.price,
      offer: null,
    };
  }
};