# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user:pass123
`This is a fragment!`

HTTP/1.1 201

[Asserts]
header "Location" matches "^http://localhost:8080/v1/fragments/[0-9a-fA-F-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]{36}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19

[Captures]
url: header "Location"

# GET the created fragment
GET {{url}}
[BasicAuth]
user:pass123

HTTP/1.1 200
# Accept text/plain with or without charset
[Asserts]
header "Content-Type" matches "^text/plain(;.*)?$"
header "Content-Length" == "19"
body == "This is a fragment!"
