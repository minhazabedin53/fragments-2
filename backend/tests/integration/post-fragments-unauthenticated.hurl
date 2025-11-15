# POST without auth -> 401
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`no auth`

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "unauthorized"