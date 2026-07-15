import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import { ProductVariant } from "../models/product.model.js";

type ReviewSeed = {
    userIndex: number;
    sku: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    isVerifiedPurchase: boolean;
    adminReply?: string;
};

export async function reviewSeeder() {

    const users = await User.findAll();
    const variants = await ProductVariant.findAll();

    if (users.length < 3)
        throw new Error("At least 3 users are required.");

    const variantMap = new Map(
        variants.map(variant => [variant.sku, variant.id])
    );

    const reviews: ReviewSeed[] = [
        {
            userIndex: 0,
            sku: "GR18-Y-215",
            rating: 5,
            comment: "کیفیت ساخت عالی بود و دقیقا مطابق تصاویر ارسال شد.",
            isApproved: true,
            isVerifiedPurchase: true,
            adminReply: "از اعتماد شما سپاسگزاریم 🌹"
        },
        {
            userIndex: 1,
            sku: "GR18-Y-215",
            rating: 4,
            comment: "بسته‌بندی مناسب بود و ارسال سریع انجام شد.",
            isApproved: true,
            isVerifiedPurchase: true
        },
        {
            userIndex: 2,
            sku: "GR18-W-260",
            rating: 4,
            comment: "رنگ طلای سفید بسیار زیباست.",
            isApproved: true,
            isVerifiedPurchase: false
        },
        {
            userIndex: 0,
            sku: "DER18-W-300",
            rating: 5,
            comment: "برای نامزدی خریدیم و فوق‌العاده بود.",
            isApproved: true,
            isVerifiedPurchase: true,
            adminReply: "مبارکتان باشد ❤️"
        },
        {
            userIndex: 1,
            sku: "GNC18-Y-500",
            rating: 3,
            comment: "در کل خوب بود ولی کمی سبک‌تر از انتظارم بود.",
            isApproved: true,
            isVerifiedPurchase: true
        },
        {
            userIndex: 2,
            sku: "MDR18-W-420",
            rating: 5,
            comment: "طراحی بسیار شیک و مناسب استفاده رسمی.",
            isApproved: false,
            isVerifiedPurchase: true
        },
        {
            userIndex: 0,
            sku: "GB18-Y-250",
            rating: 4,
            comment: "برای هدیه گرفتم و خیلی مورد پسند قرار گرفت.",
            isApproved: true,
            isVerifiedPurchase: true
        },
        {
            userIndex: 1,
            sku: "GB21-R-290",
            rating: 2,
            comment: "رنگ محصول کمی با عکس تفاوت داشت.",
            isApproved: true,
            isVerifiedPurchase: false
        },
        {
            userIndex: 2,
            sku: "LDN21-W-850",
            rating: 5,
            comment: "واقعا لوکس و با کیفیت بود.",
            isApproved: true,
            isVerifiedPurchase: true,
            adminReply: "خوشحالیم که رضایت داشتید."
        }
    ];

    for (const review of reviews) {

        const variantId = variantMap.get(review.sku);

        if (!variantId)
            continue;

        const user = users[review.userIndex];

        if (!user)
            continue;

        await Review.findOrCreate({
            where: {
                userId: user.id,
                variantId
            },
            defaults: {
                userId: user.id,
                variantId,

                rating: review.rating,
                comment: review.comment,

                isApproved: review.isApproved,
                isVerifiedPurchase: review.isVerifiedPurchase,

                adminReply: review.adminReply ?? null,
                repliedAt: review.adminReply ? new Date() : null
            }
        });

    }

}