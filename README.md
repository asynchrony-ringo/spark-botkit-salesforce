This project is aimed at bridging Spark and Salesforce via Spark bot technology.

## Getting Started

#### Create a Development Salesforce User to Authenticate Your Bot
 1. Login to your Salesforce instance.
 2. [Follow these instructions](https://help.salesforce.com/articleView?id=adding_new_users.htm&type=0) on creating a new User in Salesforce
 3. You will need to log in as the user you create in order to generate a security token
    1. Once logged in, go to the settings for your profile
    2. Under 'Personal' in the left hand navigation, select 'Reset my security token'
    3. Click on the 'Reset my security token' button
    4. Save this security token somewhere - it will be needed in the environment variables
 
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
    salesforce_username=[salesforce_user_created_above]
    salesforce_password=[salesforce_password_created_above]
    salesforce_security_token=[salesforce_security_token_created_above]
    ```

#### Setup a Public Address Through ngrok

To actually get the bot up and running, a public address is required. We used ngrok in order to create a public address that can be utilized.

 - Install ngrok globally via npm: `npm install -g ngrok`
 - Create a public address on port 3001: `ngrok http 3001`
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

#### Create
* Create an Opportunity:
    * `opp create [name] [stage] [close date]`
        * **name:** label describing your opportunity
        * **stage:** should belong to the picklist for opportunity stages in your instance of Salesforce
        * **close date:** should be in the format of YYYY-MM-DD

#### View
* View the status of an Opportunity, Lead, or Campaign by internal ID:
    * `opp status sys_id`
    * `lead status sys_id`
    * `campaign status sys_id`
* View the Opportunities, Leads, or Campaigns that are owned by you:
    * `opp owned`
    * `lead owned`
    * `campaign owned`

## Alerts
In order to receive alerts for events from Salesforce, you must first create a Trigger. Triggers reside in Salesforce as Apex code. 
Triggers will execute on specific events that happen to tables within Salesforce (e.g. - before or after update, insert, create, and delete).

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

#### Create a Trigger
------------------
1. Near the top, click "Setup"
2. In the left nav, click "Customize"
3. In the expanded nav, find and click on the entity you want to customize
4. In the next expanded nav, click "Triggers"
5. Click the "New" button
6. We have created OpportunityUpdate Trigger as an example
    1. [See all of our example Triggers](https://gitlab.asynchrony.com/proj-1274/spark-botkit-salesforce/tree/master/docs)
    2. NOTE: You will have to update the call to SFBotHttpRequest.send to pass in the public address of your bot
7. Save the Trigger
~~~~
trigger OpportunityUpdateSFBot on Opportunity (after update) {
    Map<String, List<Opportunity>> mapToSerialize = new Map<String, List<Opportunity>>();

    // The Trigger.old & Trigger.new represent a list of records before and after being altered
    mapToSerialize.put('new', Trigger.new);
    mapToSerialize.put('old', Trigger.old);
    SFBotHttpRequest.send('https://234c2e59.ngrok.io/salesforce/update', JSON.serialize(mapToSerialize));
}
~~~~

You also need to authorize your endpoint with Salesforce.

1. In the left nav, click "Security Controls"
2. In the expanded nav, click "Remote Site Settings"
3. Click the "New Remote Site" button that appears above the table
4. Enter a name for your remote site
5. Enter the URL for your remote site
6. Click the "Save" button

---

## Creating new skills

In order to create additional functionality for the bot, you will have to create a new skill that listens to a particular message and
acts accordingly. The existing skills can be found in the `src/skills` directory. The project is set up in a way that any skills located
within this directory will be registered with the Spark bot. 

Within a newly created skill, you will need to call `.hears` and provide a regex pattern that will match a certain message the user sends
to the bot in Spark, as well as a callback that will fire when the message is received. The callback takes both the bot and the message.
In order to have the bot send a message to the user, you can use the bot's `.reply(message, "custom message")` function, which takes
the original message and your bot's response.

You can interact with Salesforce by using [JSForce](https://jsforce.github.io/document/) - a Javascript library built to interact with
multiple Salesforce APIs. 
