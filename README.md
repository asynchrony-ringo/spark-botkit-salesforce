This project is aimed at bridging Spark and Salesforce via Spark box technology.

## Development Requirements
The bot is spun up within a docker container. Scripts have been written in order to
run the bot either in production or the dev environment.
 - start-dev.sh
 - start.sh

### Getting Started

 - [Create a bot in the Spark for Developers site](https://developer.ciscospark.com/add-bot.html). You'll receive an `access token`.
    - Save this access token in 1pass or somewhere else for future use: it will be required in order to run the bot
    - Copy & paste the access token as the ```access_token``` variable in the ```.env``` file of the project

To actually get the bot up and running, a public address is required. We used ngrok in order to create a public address that can be utilized.

 - Install ngrok globally via npm (```npm install -g ngrok```).
 - Create a public address on port 3000 - ```ngrok http 3000```
    - NOTE: the docker instance must be running on port 3000 in order for communication to the bot to work
 - Copy the https forwarding address in the ngrok log (```https://<########>.ngrok.io```)
 - Paste that address as the ```public_address``` variable in the ```.env``` file of the project
 - run npm install
 - make sure you have docker installed
 - ``` docker build -t asynchronyringo/salesforce-spark-bot . ```
 - run the start-dev script ./start.dev.sh

You should now be able to communicate with the bot from within Cisco Spark

## Alerts
In order to receive alerts for events from Salesforce, you must first create a Trigger. Triggers reside in Salesforce as Apex code. 
Triggers will execute on specific events that happen to tables within Salesforce (e.g. - before or after update, insert, create, and delete).

#### Create a Trigger
------------------
1. Near the top, click "Setup"
2. In the left nav, click "Customize"
3. In the expanded nav, find and click on the entity you want to customize
4. In the next expanded nav, click "Triggers"
5. Click the "New" button
6. We have created OpportunityUpdate Trigger as an example

~~~~
trigger OpportunityUpdate on Opportunity (after update) {
    Map<String, List<Opportunity>> mapToSerialize = new Map<String, List<Opportunity>>();
    
    //The Trigger.old & Trigger.new represent a list of records before and after being altered
    mapToSerialize.put('new', Trigger.new);
    mapToSerialize.put('old', Trigger.old);
    SFBotHttpRequest.send(JSON.serialize(mapToSerialize));
}
~~~~

#### Asynchronous Trigger (Sending Http Requests from Trigger)
---------------------------------------------------------------------

Asynchronous events cannot be used in triggers themselves, so you need to create one.

 1. In the left nav, click "Develop"
 2. In the expanded nav, click "Apex Classes"
 3. Click "New" in the button options bar above the table
 4. We have created SFBotHttpRequest as an example

~~~~
public class SFBotHttpRequest{
    
    //the @future annotation is used to denote Async
    @future (callout=true)
    public static void send(String updateUrl, String payload){
        
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
~~~~

You also need to authorize your endpoint with Salesforce.

1. In the left nav, click "Security Controls"
2. In the expanded nav, click "Remote Site Settings"
3. Click the "New Remote Site" button that appears above the table
4. Enter a name for your remote site
5. Enter the URL for your remote site
6. Click the "Save" button
