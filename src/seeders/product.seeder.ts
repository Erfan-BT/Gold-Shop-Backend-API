import { Product } from "../models/product.model.js"

export async function productSeeder () {
    const [product1] = await Product.findOrCreate({
        where: { slug: 'gold-ring-18k' },
        defaults: {
            title: 'انگشتر طلای ۱۸ عیار',
            slug: 'gold-ring-18k',
            description: 'انگشتر طلای ۱۸ عیار با طراحی کلاسیک و وزن ۲.۱۵ گرم. مناسب برای استفاده روزمره و هدیه.',
            isActive: true,
        }
    })

    const [product2] = await Product.findOrCreate({
        where: { slug: 'diamond-engagement-ring' },
        defaults: {
            title: 'انگشتر نامزدی الماس',
            slug: 'diamond-engagement-ring',
            description: `انگشتر نامزدی با الماس طبیعی
            ویژگی‌ها:
            • وزن طلا: ۳.۰۰ گرم
            • عیار: ۱۸
            • سنگ: الماس ۰.۵۰ قیراط
            • طراحی: مدرن و شیک
            • مناسب برای: هدیه نامزدی و سالگرد ازدواج
            • گارانتی: ۱۲ ماهه`,
            isActive: true,
        }
    })

    const [product3] = await Product.findOrCreate({
        where: { slug: 'gold-necklace-classic' },
        defaults: {
            title: 'گردنبند طلای کلاسیک',
            slug: 'gold-necklace-classic',
            description: 'گردنبند طلای ۱۸ عیار با طرح کلاسیک و ظریف. وزن ۵.۰۰ گرم.',
            isActive: false,
        }
    })

    const [product4] = await Product.findOrCreate({
        where: { slug: 'mens-diamond-ring' },
        defaults: {
            title: 'انگشتر الماس مردانه',
            slug: 'mens-diamond-ring',
            description: `<h3>انگشتر الماس مردانه</h3>
            <p>انگشتر با طراحی خاص و مدرن برای آقایان</p>
            <ul>
                <li><strong>وزن:</strong> ۴.۲۰ گرم</li>
                <li><strong>عیار:</strong> ۱۸</li>
                <li><strong>سنگ:</strong> الماس ۰.۳۰ قیراط</li>
                <li><strong>رنگ:</strong> طلای سفید</li>
            </ul>
            <p>مناسب برای: استفاده رسمی و مجالس</p>`,
            isActive: true,
        }
    })

    const [product5] = await Product.findOrCreate({
        where: { slug: 'gold-bracelet' },
        defaults: {
            title: 'دستبند طلای زنانه',
            slug: 'gold-bracelet',
            description: 'دستبند طلای ۱۸ عیار با طراحی ظریف و شیک. وزن ۲.۵۰ گرم.',
            isActive: true,
        }
    })

    const [product6] = await Product.findOrCreate({
        where: { slug: 'luxury-diamond-necklace' },
        defaults: {
            title: 'گردنبند الماس لوکس',
            slug: 'luxury-diamond-necklace',
            description: `گردنبند الماس با طراحی منحصربه‌فرد و سنگ‌های الماس با کیفیت بالا. 
            این گردنبند با استفاده از بهترین متریال‌ها ساخته شده و برای مناسبت‌های خاص و هدیه‌های ارزشمند طراحی شده است. 
            وزن طلا ۸.۵۰ گرم، عیار ۲۱، الماس ۱.۲۰ قیراط، دارای گارانتی ۲۴ ماهه و کارت تضمین اصالت. 
            طراحی مدرن و شیک، مناسب برای استفاده در جشن‌ها و مهمانی‌های رسمی.`,
            isActive: true,
        }
    })
}

export async function productVariantSeeder () {
    
}