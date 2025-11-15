POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user:pass123
`{"ok":true}`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user:pass123

HTTP/1.1 200
[Asserts]
header "Content-Type" matches "^application/json(;.*)?$"
jsonpath "$.ok" == true