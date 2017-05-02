* Check the status of an Opportunity, Lead, or Campaign by internal ID:
    * `opp status sys_id`
    * `lead status sys_id`
    * `campaign status sys_id`
* Create an Opportunity:
    * `opp create <name> <stage> <close date>`
        * stage must belong to the picklist for opportunity stages in your instance of Salesforce
        * close date should be in the format of YYYY-MM-DD
* View the Opportunities, Leads, or Campaigns that you own:
    * `opp owned`
    * `lead owned`
    * `campaign owned`
