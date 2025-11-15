POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user:pass123
`Hello charset`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user:pass123

HTTP/1.1 200
[Asserts]
header "Content-Type" matches "^text/plain(;\\s*charset=utf-8)?$"
body == "Hello charset"