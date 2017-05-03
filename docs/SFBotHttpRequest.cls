public class SFBotHttpRequest{
    // the @future annotation is used to denote Async
    @future (callout=true)
    public static void send(String updateUrl, String payload) {
    HttpRequest req = new HttpRequest();
    Http http = new Http();
    HttpResponse resp = new HttpResponse();

    req.setEndpoint(updateUrl);
    req.setMethod('POST');
    req.setHeader('content-type', 'application/json');
    req.setHeader('Content-Length','10240');

    req.setBody(payload);
    http.send(req);
    }
}
