import {describe, expect, it} from "@jest/globals"
import {
  camelCase,
  coalesce,
  kebabCase,
  mediaTypeToIdentifier,
  normalizeFilename,
  snakeCase,
  titleCase,
} from "./utils"

describe("core/utils", () => {
  describe("#coalesce", () => {
    it("returns the first defined parameter", () => {
      expect(coalesce(null, undefined, 1, 2)).toBe(1)
    })
    it("returns 0 when it is the first defined parameter", () => {
      expect(coalesce(null, undefined, 0, 2)).toBe(0)
    })
    it("returns '' when it is the first defined parameter", () => {
      expect(coalesce(null, undefined, "", "foo")).toBe("")
    })
    it("throws if no parameters are defined", () => {
      expect(() => coalesce(null, undefined)).toThrow(
        "all arguments are null or undefined",
      )
    })
  })

  describe("#titleCase", () => {
    it.each([
      ["single", "Single"],
      ["two words", "TwoWords"],
      ["camelCase", "CamelCase"],
    ])("%s -> %s", (input, expected) => {
      expect(titleCase(input)).toBe(expected)
    })
  })

  describe("#normalizeFilename", () => {
    const cases = [
      {
        input: "./relative-file.ts",
        camel: "./relativeFile.ts",
        title: "./RelativeFile.ts",
        snake: "./relative_file.ts",
        kebab: "./relative-file.ts",
      },
      {
        input: "./directory/relative file.ts",
        camel: "./directory/relativeFile.ts",
        title: "./directory/RelativeFile.ts",
        snake: "./directory/relative_file.ts",
        kebab: "./directory/relative-file.ts",
      },
      {
        input: "/directory/absolute.ts",
        camel: "/directory/absolute.ts",
        title: "/directory/Absolute.ts",
        snake: "/directory/absolute.ts",
        kebab: "/directory/absolute.ts",
      },
    ]

    it.each(cases)(
      "transforms to camelCase $input -> $camel",
      ({input, camel}) => {
        expect(normalizeFilename(input, "camel-case")).toBe(camel)
      },
    )

    it.each(cases)(
      "transforms to TileCase $input -> $title",
      ({input, title}) => {
        expect(normalizeFilename(input, "title-case")).toBe(title)
      },
    )
    it.each(cases)(
      "transforms to snake_case $input -> $snake",
      ({input, snake}) => {
        expect(normalizeFilename(input, "snake-case")).toBe(snake)
      },
    )
    it.each(cases)(
      "transforms to kebab-case $input -> $kebab",
      ({input, kebab}) => {
        expect(normalizeFilename(input, "kebab-case")).toBe(kebab)
      },
    )
  })

  describe("#identifier", () => {
    const cases = [
      {
        input: "word",
        camel: "word",
        title: "Word",
        snake: "word",
        kebab: "word",
      },
      {
        input: "two words",
        camel: "twoWords",
        title: "TwoWords",
        snake: "two_words",
        kebab: "two-words",
      },
      {
        input: "2 special chars",
        camel: "specialChars",
        title: "SpecialChars",
        snake: "special_chars",
        kebab: "special-chars",
      },
      {
        input: "trailingNumber12",
        camel: "trailingNumber12",
        title: "TrailingNumber12",
        snake: "trailing_number_12",
        kebab: "trailing-number-12",
      },
      {
        input: "GitHub v3 REST API",
        camel: "gitHubV3RestApi",
        title: "GitHubV3RestApi",
        snake: "git_hub_v_3_rest_api",
        kebab: "git-hub-v-3-rest-api",
      },
      {
        input: "Okta OpenID Connect & OAuth 2.0",
        camel: "oktaOpenIdConnectOAuth20",
        title: "OktaOpenIdConnectOAuth20",
        snake: "okta_open_id_connect_o_auth_2_0",
        kebab: "okta-open-id-connect-o-auth-2-0",
      },
    ]

    it.each(cases)(
      "transforms to camelCase $input -> $camel",
      ({input, camel}) => {
        expect(camelCase(input)).toBe(camel)
      },
    )

    it.each(cases)(
      "transforms to TileCase $input -> $title",
      ({input, title}) => {
        expect(titleCase(input)).toBe(title)
      },
    )
    it.each(cases)(
      "transforms to snake_case $input -> $snake",
      ({input, snake}) => {
        expect(snakeCase(input)).toBe(snake)
      },
    )
    it.each(cases)(
      "transforms to kebab-case $input -> $kebab",
      ({input, kebab}) => {
        expect(kebabCase(input)).toBe(kebab)
      },
    )

    it("throws if the transformed result is a reserved word", () => {
      expect(() => camelCase("async")).toThrow(TypeError)
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
