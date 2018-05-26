/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const data = require('data.js');
const arraySort = require('array-sort');
const _ = require('lodash');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

const SKILL_NAME = 'Appointments';
const GET_PAITENT_MSG = 'Here are the details about your patient ';
const GET_APPOINTMENTs_MSG = 'You have a total of';
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const FALLBACK_MESSAGE = 'The appointments skill can\'t help you with that.  It can help you find the list of appointments for any particular day or time. What can I help you with?';
const FALLBACK_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/lambda/data
//=========================================================================================================================================


//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const GetAppointmentsHandler = {
  
  canHandle(handlerInput) {
    console.log("get appointments caalled"+ handlerInput);
    const request = handlerInput.requestEnvelope.request;
    console.log("get appointments called Request : "+request);
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'dpaAppointment');
  },
  handle(handlerInput) {
    console.log("get appointments called data : "+data);
    const appointments = arraySort(data.appointments, 'date');
    console.log("get appointments called sorted data : "+appointments);
    const totAppointments = appointments.length;
    const date = new Date(appointments[0].date);
    const speechOutput = GET_APPOINTMENTs_MSG + ", "+totAppointments+" appointments today with the earliest at "+ date.getHours()+" "+ date.getMinutes()+" hours with "+appointments[0].name;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, appointments[0].name)
      .getResponse();
  },
};

const GetFreetimehandler = {
  
  canHandle(handlerInput) {
    console.log("get free time called");
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'free');
  },
  handle(handlerInput) {
    console.log("get free time called inside handle");
    const appointments = arraySort(data.appointments, 'date');
    console.log("get free time called sorted data : "+appointments);
    const totAppointments = appointments.length;
    
    var dateAppointments = [];
    const input = handlerInput.requestEnvelope.request.intent.slots.time.value;
    console.log("input date : "+input);
    const inputDate = new Date(input);
    console.log(inputDate.getDate());
    const result = inputDate.getDate()+" "+ inputDate.getMonth()+ " "+ inputDate.getFullYear();
    for(var i=0;i<totAppointments;i++){
      var date = new Date(appointments[i].date);
      console.log("date "+ date.getDate());
      if(date.getDate() === inputDate.getDate()){
        dateAppointments.push(appointments[i]);
      }
    }
    const totDateAppoints = dateAppointments.length;
    console.log("total date appontments : "+totDateAppoints);
    
    var speechOutput;
    const date1 = new Date(dateAppointments[0].date);
    const date2 = new Date(dateAppointments[totDateAppoints-1].date);
    if(totDateAppoints == 0){
      speechOutput = "You do not have any appointments for "+ result ;
    }else if(totDateAppoints < 4){
      speechOutput = "You just have "+totDateAppoints+" appointments for "+result+". You are free before "+date1.getHours()+" "+date1.getMinutes()+" hours and after "+date2.getHours()+" "+date2.getMinutes()+" hours";
    }else if(3 < totAppointments < 8){
      speechOutput = "You have "+totDateAppoints+" appointments for "+result+". You are free before "+date1.getHours()+" "+date1.getMinutes()+" hours and after "+date2.getHours()+" "+date2.getMinutes()+" hours";
    }else{
      speechOutput = "You have "+totDateAppoints+" appointments for "+result+". You are free before "+date1.getHours()+" "+date1.getMinutes()+" hours and after "+date2.getHours()+" "+date2.getMinutes()+" hours. I guess you are pretty occupied ";
    }
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, appointments[0].name)
      .getResponse();
  },
};

const GetPaitentDetailsHandler = {
  canHandle(handlerInput) {
    console.log("get patient details called"+ handlerInput);
    const request = handlerInput.requestEnvelope.request;
    console.log("get  patient details called request : "+request);
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'patient_details');
  },
  handle(handlerInput) {
    console.log("get  patient details called data : "+data.patientDetails);
    const patientName = handlerInput.requestEnvelope.request.intent.slots.patientName.value;
    const patient = _.filter(data.patientDetails, x => x.name.toLowerCase() === patientName.toLowerCase());
    console.log("get  patient details called patient found : "+patient[0].name);
    const date = new Date(patient[0].date);
    const speechOutput = GET_PAITENT_MSG + patient[0].name+". "+patient[0].name+" is suffering from "+patient[0].disease+" and has an appointment at "+ date.getHours()+" "+date.getMinutes()+" hours";

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, patient[0].name)
      .getResponse();
  },
};

const getPatientStatusHandler = {
  canHandle(handlerInput) {
    console.log("get patient status called");
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'patientStatus');
  },
  handle(handlerInput) {
    console.log("get  patient status called data : "+data.patientDetails);
    const patients = data.patientDetails;
    const totPatients = patients.length;
    console.log("get patient status total patients : "+totPatients);
    const criticalPatients = _.filter(patients, x => x.state.toLowerCase() === 'Critical'.toLowerCase());
    console.log("get patient status critical patients : "+criticalPatients.length);
    const speechOutput = "You have a total of "+ totPatients+" patients admitted as of today, out of which "+criticalPatients.length+" are still in critical condition.";

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .getResponse();
  },
};

const getSpecificPatients = {
  canHandle(handlerInput) {
    console.log("get specific patients called");
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'specificPatients');
  },
  handle(handlerInput) {
    var speechOutput;
    console.log("get specific patients called data : "+data.appointments);
    const patients = data.appointments;
    const totPatients = patients.length;
    console.log("get specific patients total patients : "+totPatients);
    const patientState = handlerInput.requestEnvelope.request.intent.slots.patientState.value;
     console.log("get specific patients of type : "+patientState);
    const specificPatients = _.filter(patients, x => x.state.toLowerCase() === patientState.toLowerCase());
    console.log("get specific patients, "+patientState+" patients : "+specificPatients.length);
    var patientNames = "";

    if(specificPatients.length > 0){
      for(var i=0;i<specificPatients.length-1;i++){
      patientNames = patientNames + specificPatients[i].name + ",";
      }
      patientNames = patientNames+" and "+specificPatients[specificPatients.length-1].name;
      speechOutput = "You have a total of "+ specificPatients.length+" "+patientState+" patients and they are "+patientNames;
    }else{
      speechOutput = "You do not have any "+patientState+" patients";
    }
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const FallbackHandler = {
  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
  //              This handler will not be triggered except in that locale, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE)
      .reprompt(FALLBACK_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetAppointmentsHandler,
    GetFreetimehandler,
    GetPaitentDetailsHandler,
    getPatientStatusHandler,
    getSpecificPatients,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
