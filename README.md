This project is aimed at bridging Spark and Salesforce via Spark bot technology.

## Getting Started

#### Create the Bot

 - [Create a bot in the Spark for Developers site](https://developer.ciscospark.com/add-bot.html). You'll receive an `access token`.
    - Save this access token securely for future use: it will be required in order to run the bot

#### Setup Your Project's Environment Variables
 - Create a `.env` environment variables file in the root directory of the project.
    - This file will contain all your local environment variables that get loaded by the project.
 - Populate your `.env` file with the following variables:

    ```
    access_token=[bot_access_token_from_spark]
    base_url=[salesforce_instance_base_url]
    bot_name=[bot_name_from_spark]
    salesforce_username=[salesforce_user]
    salesforce_password=[salesforce_password]
    ```

#### Setup a Public Address Through ngrok

To actually get the bot up and running, a public address is required. We used ngrok in order to create a public address that can be utilized.

 - Install ngrok globally via npm: `npm install -g ngrok`
 - Create a public address on port 3000: `ngrok http 3000`
 - ngrok should create a session with a unique `http` and `https` forwarding address (something like: `https://bb94ea5d.ngrok.io`)
 - Add the `https` forwarding address to your `.env` file as follows:

    ```
    public_address=[ngrok_https_forwarding_address]
    ```

### Build and Run

 - install necessary node packages: `npm install`
 - build the docker image for the project: `docker build -t cisco/salesforce-spark-bot .`
 - spin up the docker container: `./start.dev.sh`
    - NOTE: To spin up the docker container in production, run: `start.sh`


You should now be able to communicate with the bot from within Cisco Spark.

---

## Bot Commands - How to Talk With Your Bot

- You can ask your bot for help (`@BotName help`) to display the available commands within Spark:

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
    1. [See all of our example Triggers](https://gitlab.asynchrony.com/proj-1274/spark-botkit-salesforce/tree/master/docs)
    2. Note: You will have to update the call to SFBotHttpRequest.send to pass in the public address of your bot

~~~~
trigger OpportunityUpdateSFBot on Opportunity (after update) {
    Map<String, List<Opportunity>> mapToSerialize = new Map<String, List<Opportunity>>();

    // The Trigger.old & Trigger.new represent a list of records before and after being altered
    mapToSerialize.put('new', Trigger.new);
    mapToSerialize.put('old', Trigger.old);
    SFBotHttpRequest.send('https://234c2e59.ngrok.io/salesforce/update', JSON.serialize(mapToSerialize));
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
~~~~

You also need to authorize your endpoint with Salesforce.

1. In the left nav, click "Security Controls"
2. In the expanded nav, click "Remote Site Settings"
3. Click the "New Remote Site" button that appears above the table
4. Enter a name for your remote site
5. Enter the URL for your remote site
6. Click the "Save" button
