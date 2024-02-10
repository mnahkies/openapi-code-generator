/**
 * @prettier
 */

import {describe, expect, it} from "@jest/globals"
import {mediaTypeToIdentifier, titleCase} from "./utils"

describe("core/utils", () => {
  describe("#titleCase", () => {
    it.each([
      ["single", "Single"],
      ["two words", "TwoWords"],
      ["camelCase", "CamelCase"],
    ])("%s -> %s", (input, expected) => {
      expect(titleCase(input)).toBe(expected)
    })
  })

  describe("#mediaTypeToIdentifier", () => {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types ¯\_(ツ)_/¯
    it.each([
      ["audio/aac", "AudioAac"],
      ["application/x-abiword", "ApplicationXAbiword"],
      ["image/apng", "ImageApng"],
      ["application/x-freearc", "ApplicationXFreearc"],
      ["image/avif", "ImageAvif"],
      ["video/x-msvideo", "VideoXMsvideo"],
      ["application/vnd.amazon.ebook", "ApplicationVndAmazonEbook"],
      ["application/octet-stream", "ApplicationOctetStream"],
      ["image/bmp", "ImageBmp"],
      ["application/x-bzip", "ApplicationXBzip"],
      ["application/x-bzip2", "ApplicationXBzip2"],
      ["application/x-cdf", "ApplicationXCdf"],
      ["application/x-csh", "ApplicationXCsh"],
      ["text/css", "TextCss"],
      ["text/csv", "TextCsv"],
      ["application/msword", "ApplicationMsword"],
      [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "ApplicationVndOpenxmlformatsOfficedocumentWordprocessingmlDocument",
      ],
      ["application/vnd.ms-fontobject", "ApplicationVndMsFontobject"],
      ["application/epub+zip", "ApplicationEpubZip"],
      ["application/gzip", "ApplicationGzip"],
      ["image/gif", "ImageGif"],
      ["text/html", "TextHtml"],
      ["image/vnd.microsoft.icon", "ImageVndMicrosoftIcon"],
      ["text/calendar", "TextCalendar"],
      ["application/java-archive", "ApplicationJavaArchive"],
      ["image/jpeg", "ImageJpeg"],
      ["text/javascript", "TextJavascript"],
      ["application/json", "Json"],
      ["application/ld+json", "ApplicationLdJson"],
      ["audio/midi", "AudioMidi"],
      ["text/javascript", "TextJavascript"],
      ["audio/mpeg", "AudioMpeg"],
      ["video/mp4", "VideoMp4"],
      ["video/mpeg", "VideoMpeg"],
      [
        "application/vnd.apple.installer+xml",
        "ApplicationVndAppleInstallerXml",
      ],
      [
        "application/vnd.oasis.opendocument.presentation",
        "ApplicationVndOasisOpendocumentPresentation",
      ],
      [
        "application/vnd.oasis.opendocument.spreadsheet",
        "ApplicationVndOasisOpendocumentSpreadsheet",
      ],
      [
        "application/vnd.oasis.opendocument.text",
        "ApplicationVndOasisOpendocumentText",
      ],
      ["audio/ogg", "AudioOgg"],
      ["video/ogg", "VideoOgg"],
      ["application/ogg", "ApplicationOgg"],
      ["audio/opus", "AudioOpus"],
      ["font/otf", "FontOtf"],
      ["image/png", "ImagePng"],
      ["application/pdf", "ApplicationPdf"],
      ["application/x-httpd-php", "ApplicationXHttpdPhp"],
      ["application/vnd.ms-powerpoint", "ApplicationVndMsPowerpoint"],
      [
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "ApplicationVndOpenxmlformatsOfficedocumentPresentationmlPresentation",
      ],
      ["application/vnd.rar", "ApplicationVndRar"],
      ["application/rtf", "ApplicationRtf"],
      ["application/x-sh", "ApplicationXSh"],
      ["image/svg+xml", "ImageSvgXml"],
      ["application/x-tar", "ApplicationXTar"],
      ["image/tiff", "ImageTiff"],
      ["video/mp2t", "VideoMp2T"],
      ["font/ttf", "FontTtf"],
      ["text/plain", "Text"],
      ["application/vnd.visio", "ApplicationVndVisio"],
      ["audio/wav", "AudioWav"],
      ["audio/webm", "AudioWebm"],
      ["video/webm", "VideoWebm"],
      ["image/webp", "ImageWebp"],
      ["font/woff", "FontWoff"],
      ["font/woff2", "FontWoff2"],
      ["application/xhtml+xml", "ApplicationXhtmlXml"],
      ["application/vnd.ms-excel", "ApplicationVndMsExcel"],
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet",
      ],
      ["application/xml", "Xml"],
      ["application/vnd.mozilla.xul+xml", "ApplicationVndMozillaXulXml"],
      ["application/zip", "ApplicationZip"],
      ["video/3gpp", "Video3Gpp"],
      ["video/3gpp2", "Video3Gpp2"],
      ["application/x-7z-compressed", "ApplicationX7ZCompressed"],
    ])("%s -> %s", async (contentType, expected) => {
      expect(mediaTypeToIdentifier(contentType)).toBe(expected)
    })
  })
})
