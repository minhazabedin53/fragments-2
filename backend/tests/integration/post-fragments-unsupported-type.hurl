# POST unsupported type -> 415
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user:pass123
`fake png bytes`

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415