# 404 route should return JSON error
GET http://localhost:8080/no-such-route

HTTP/1.1 404

[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" isString