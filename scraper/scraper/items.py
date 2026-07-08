import scrapy


class AmazonProductItem(scrapy.Item):
    url = scrapy.Field()
    title = scrapy.Field()
    image_url = scrapy.Field()
    price = scrapy.Field()
    currency = scrapy.Field()
    asin = scrapy.Field()
    response_status = scrapy.Field()
