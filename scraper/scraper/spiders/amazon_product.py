import json
import re

import scrapy
from scraper.items import AmazonProductItem


class AmazonProductSpider(scrapy.Spider):
    name = "amazon_product"

    custom_settings = {
        "DOWNLOADER_MIDDLEWARES": {
            "scrapy.downloadermiddlewares.useragent.UserAgentMiddleware": None,
        },
    }

    def __init__(self, *args, **kwargs):
        urls = kwargs.pop("urls", None)
        if not urls:
            spider_args = kwargs.pop("spider_arguments", None)
            if spider_args:
                if isinstance(spider_args, str):
                    try:
                        parsed = json.loads(spider_args)
                        urls = parsed.get("urls", "")
                    except json.JSONDecodeError:
                        urls = ""
                elif isinstance(spider_args, dict):
                    urls = spider_args.get("urls", "")
        self.start_urls = urls.split(",") if urls else []
        super().__init__(*args, **kwargs)

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/125.0.0.0 Safari/537.36"
                    ),
                    "Accept": (
                        "text/html,application/xhtml+xml,application/xml;"
                        "q=0.9,image/avif,image/webp,*/*;q=0.8"
                    ),
                    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Sec-Ch-Ua": (
                        '"Google Chrome";v="125", '
                        '"Chromium";v="125", "Not.A/Brand";v="24"'
                    ),
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": '"Windows"',
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1",
                    "Upgrade-Insecure-Requests": "1",
                    "Referer": "https://www.google.com/",
                },
                cookies={
                    "session-id": "257-1234567-8901234",
                    "i18n-prefs": "EUR",
                    "lc-main": "de_DE",
                },
            )

    def parse(self, response):
        self.logger.info("Status: %s — URL: %s", response.status, response.url)

        # Check if blocked
        body_text = response.text.lower()
        if any(
            keyword in body_text
            for keyword in [
                "captcha",
                "robot",
                "automierte anfragen",
                "unusual traffic",
                "enter the characters",
                "geben sie die zeichen",
            ]
        ):
            self.logger.warning("BLOCKED — CAPTCHA or robot check at %s", response.url)

        item = AmazonProductItem()
        item["url"] = response.url
        item["response_status"] = response.status

        item["title"] = (
            response.css('meta[property="og:title"]::attr(content)').get()
            or response.css("#productTitle::text").get("")
            or response.css("h1::text").get("")
        )
        if isinstance(item["title"], str):
            item["title"] = item["title"].strip()

        item["image_url"] = (
            response.css('meta[property="og:image"]::attr(content)').get()
            or response.css("#landingImage::attr(src)").get()
            or response.css("#imgTagWrapperId img::attr(src)").get()
        )

        whole = response.css("span.a-price-whole::text").get("")
        if whole:
            whole = whole.strip()
            fraction = response.css("span.a-price-fraction::text").get("")
            item["price"] = f"{whole}.{fraction}" if fraction else whole
            item["currency"] = "EUR"
        else:
            item["price"] = response.css(
                'meta[property="product:price:amount"]::attr(content)'
            ).get()
            item["currency"] = (
                response.css(
                    'meta[property="product:price:currency"]::attr(content)'
                ).get()
                or "EUR"
            )

        match = re.search(r"/(?:dp|product)/([A-Z0-9]{10})", response.url)
        item["asin"] = match.group(1) if match else None

        yield item
