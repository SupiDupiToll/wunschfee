import os

BOT_NAME = "scraper"

SPIDER_MODULES = ["scraper.spiders"]
NEWSPIDER_MODULE = "scraper.spiders"

ROBOTSTXT_OBEY = False

CONCURRENT_REQUESTS = 1
DOWNLOAD_DELAY = 2.5
RANDOMIZE_DOWNLOAD_DELAY = True

COOKIES_ENABLED = False

RETRY_ENABLED = True
RETRY_TIMES = 3

DOWNLOAD_TIMEOUT = 30

AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 2.0
AUTOTHROTTLE_MAX_DELAY = 30.0
AUTOTHROTTLE_TARGET_CONCURRENCY = 0.5

zyte_api_key = os.environ.get("ZYTE_API_KEY")
if zyte_api_key:
    DOWNLOAD_HANDLERS = {
        "http": "scrapy_zyte_api.ScrapyZyteAPIDownloadHandler",
        "https": "scrapy_zyte_api.ScrapyZyteAPIDownloadHandler",
    }
    DOWNLOADER_MIDDLEWARES = {
        "scrapy_zyte_api.ScrapyZyteAPIDownloaderMiddleware": 1000,
    }
    REQUEST_FINGERPRINTER_CLASS = "scrapy_zyte_api.ScrapyZyteAPIRequestFingerprinter"
    TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
    ZYTE_API_KEY = zyte_api_key
    ZYTE_API_TRANSPARENT_MODE = True
