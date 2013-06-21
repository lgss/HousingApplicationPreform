(function () {
	'use strict';
	var nbcApp = nbcApp || {models: {}};

	nbcApp.models.App = function () {
		var self = this;
		this.applyUrl = "http://www.northampton.gov.uk/info/200183/housing_allocations/1784/completing_a_housing_application";
		this.iframe = true;
		this.questions = ko.observableArray();
		this.currentQ = ko.observable(0);
		this.prevQuestions = ko.observableArray();
		this.apply = ko.observable(false);
		this.ready = ko.observable(false);
		this.pmDomain = "http://www.northampton.gov.uk";
		this.moveon = ko.computed(function(){
			(self.apply()) ? self.triggerLink(self.applyUrl) : false;
		},this);

		//handles a url to the parent or a new window
		this.triggerLink = function(url) {
			(self.iframe) ? self.sendMessageToParent(url) : window.location = url;
		}

		/**
		* sends a message to the parent window
		* containing the url to be loaded, 
		* fallback for IE7 to open a new window
		*/
		this.sendMessageToParent = function(url) {
			(window.postMessage !== undefined) ? window.parent.postMessage(url,self.pmDomain) : window.open(url);
		};

		this.prevQ = function (){
			if(self.prevQuestions().length){
				self.currentQ(self.prevQuestions.pop());
			}
		}

		//move to the next question
		this.nextQ = function () {
			//store current question index
			self.prevQuestions.push(self.currentQ());

			if(this.link()){
				self.triggerLink(this.link());
			} 
			else{
				(this.nextQ() >= self.questions().length) ?	self.apply(true) : self.apply(false);
				self.currentQ(this.nextQ());
				if(window.onhashchange !== undefined){
					window.location.hash = self.currentQ();
				}
			}
		};

		//listen for hash change in supporting browsers
		this.hashChanges = function (el) {
			if(window.onhashchange !== undefined){
				window.onhashchange = function (e){
					var h = parseInt(window.location.hash.replace('#',''),10);

					if(isNaN(h)){
						h = 0;
					}

					if(self.currentQ() !== h){
						(h >= self.questions().length) ? self.apply(true) : self.apply(false);
						self.currentQ(h);
					}

				};
			}
		};



		//sets up the model objects and properties
		this.init = function (data, container) {

			//take a reference to the data
			var questions = data;

			//loop through the questions array
			for (var i = 0; i < questions.length; i += 1) {
				var question = new nbcApp.models.Question(),
					answers = questions[i].answers;

				//se the question properties
				question.content(questions[i].question);
				question.index(i);

				/**
				* loop through all answers for the question
				* create an instance of the answer object
				* set the properties and push to the 
				* answers array
				*/
				for (var n = 0; n < answers.length; n += 1) {
					var answer = new nbcApp.models.Answer();
					answer.content(answers[n].answer);
					answer.link(answers[n].link);
					answer.nextQ(answers[n].next);
					answer.tooltip(answers[n].info);
					question.answers.push(answer);
				}

				//add the current question to the knockout array of questions
				self.questions.push(question);

			}


			//remove any hash on page load
			if(window.location.hash){
				window.location.hash = '';
			}

			//set up hash change listener
			self.hashChanges();

			//confirm everything's loaded
			self.ready(true);

			//if everything's loaded, show the new content
			(self.ready()) ? document.getElementById(container).className = "" : self.ready(false);
		};

	}

	nbcApp.models.Question = function () {
		var self = this;
		this.index = ko.observable();
		this.content = ko.observable();
		this.answers = ko.observableArray();
		
	};

	nbcApp.models.Answer = function () {
		var self = this;
		this.content = ko.observable();
		this.link = ko.observable();
		this.nextQ = ko.observable();
		this.tooltip = ko.observable();
		this.tooltipOn = ko.observable(false);
		this.toggleTooltip = function(e){
			(!self.tooltipOn()) ? self.tooltipOn(true) : self.tooltipOn(false);
			e.preventDefault();
		}
	};


	// Question Data Model
	// question : the question text / html
	// answers	: an array of possible answers
	// 			answer : the text to display for an answers button
	//			link   : the link to immediately redirect to if the answer is selected
	//			next   : the index of the next question to display 

	var json = [
		{//2A (0)
			"question" : "Have you (or someone on your behalf) already completed a housing application and submitted it to Northampton Borough Council?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 1 //2A.1
				},
				{
					"answer" : "No",
					"next" : 6 //2B
				}
			]
		},
		{//2A.1 (1)
			"question" : "Would you like to:",
			"answers" : [
				{
					"answer" : "Tell us about a <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1299/housing_allocations-change_in_circumstances' target='_blank'>change to your circumstances</a>",
					"link" : "http://www.northampton.gov.uk/info/200183/applying_for_housing/1299/housing_allocations-change_in_circumstances" //COC form
				},
				{
					"answer" : "Enquire about the progress to your application",
					"next" : 2 //2A.1.1
				},
				{
					"answer" : "Discuss something else",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1770/housing_application_progress_4"
				}
			]
		},
		{//2A.1.1 (2)
			"question" : "Have you received a letter from us about your application?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 3 //2A.1.1.1
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1770/the_progress_of_your_housing_application_progress_4"
				}
			]
		},
		{//2A.1.1.1 (3)
			"question" : "Did the letter:",
			"answers" : [
				{
					"answer" : "Request that you bring in <a href='https://www.northampton.gov.uk/downloads/file/3675/supporting_documentation' target='_blank'>documents</a> as proof of identity, eligibility, residence and/or current circumstances?",
					"next" : 4 //2A.1.1.1.1 
				},
				{
					"answer" : "Tell you about your place on the housing register and/or your banding?",
					"next" : 5, //2A.1.1.1.2
					"info" : '<a href="http://www.northampton.gov.uk/info/200183/housing_allocations/1713/the_housing_allocation_policy_explained" target="_blank">Housing Register</a>'
				},
				{
					"answer" : "Ask you to clarify any details about your application?",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1770/the_progress_of_your_housing_application_progress_4"
				}
			]
		},
		{//2A.1.1.1.1 (4)
			"question" : "Have you already brought or sent in your documents for copying?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1767/housing_application_progress_1"
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1768/housing_application_progress_2"
				}
			]
		},
		{//2A.1.1.1.2 (5)
			"question" : "Do you want to <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1302/housing_allocations-reviews_and_appeals' target='_blank'>appeal</a> against the decision?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1302/housing_allocations-reviews_and_appeals"
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1770/the_progress_of_your_housing_application_progress_4"
				}
			]
		},
		{//2B (6)
			"question" : "Are you a current Northampton Borough Council tenant or a tenant of a Northampton <a href='http://www.northampton.gov.uk/info/100007/housing/1272/housing_associations' title='Housing Association List' target='_blank'>Housing Association</a>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 7 //2B.1
				},
				{
					"answer" : "No",
					"next" : 9 //3
				}
			]
		},
		{//2B.1 (7)
			"question" : "Please tell us the reason you want or need to move",
			"answers" : [
				{
					"answer" : "You want to move to a smaller property (you are under-occupying your home)",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1773/current_tenancy_3",
					"info" : '<h3>Under-Occupying</h3><p>Northampton Borough Council will run incentive schemes aimed at tenants transferring into smaller properties, they may be under occupying 2, 3, 4, 5 and 6 bedroom properties.</p><p>You will be considered as under-occupying if you have more bedrooms than you need. Under the new rules, one bedroom is allowed for each of the following:</p><ul><li>every adult couple</li><li>any other adult aged 16 or over</li><li>any two children of the same sex aged under 16</li><li>any two children aged under 10 regardless of gender</li><li>any other child agred under 16</li><li>a non-resident carer (the claimant or their partner has a disability and need overnight care)</li></ul>'
				},
				{
					"answer" : "You are overcrowded in your home",
					"next" : 8, //2B.1.1
					"info" : "<h3>Overcrowding</h3><p>Statutory overcrowding as defined by Part X of Housing Act 1985 or a Court Order to re-house. <a href='http://www3.westminster.gov.uk/docstores/publications_store/overcrowding excerpt.pdf' target='_blank'>More information on overcrowding</a></p>"
				},
				{
					"answer" : "You need to move for a severe medical or welfare reason",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1773/current_tenancy_3",
					"info" : "severe medical or welfare reason"
				},
				{
					"answer" : "You want to mutually exchange your accommodation",
					"link" : "http://www.northampton.gov.uk/info/200027/council_housing/1261/mutual_exchanges"
					
				},
				
				{
					"answer" : "You want to move for another reason",
					"next" : 54 //13
				}
			]
		},
		{//2B.1.1 (8)
			"question" : "Are you in rent arrears?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1771/current_tenancy_1"
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1773/advice_for_existing_tenants_3"
				}
			]
		},
		{//3 (9)
			"question" : "How old are you?",
			"answers" : [
				{
					"answer" : "Under 16",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1774/contact_us_for_advice"
				},
				{
					"answer" : "16 or over",
					"next" : 10 //4
				}
				
			]
		},
		{//4 (10)
			"question" : "Are you a <a href='http://www.ukba.homeoffice.gov.uk/britishcitizenship/aboutcitizenship/' target='_blank'>British Citizen</a>? ",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 11 //4.1
				},
				{
					"answer" : "No",
					"next" :  13 //4.2
				}
			]
		},
		{//4.1 (11)
			"question" : "Do you live in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>United Kingdom</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 21 //5
				},
				{
					"answer" : "No",
					"next" : 12 //4.1.1
				}
			]
		},
		{//4.1.1 (12)
			"question" : "Are you serving in <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>HM Forces</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 21 //5
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				}
			]
		},
		{//4.2 (13)
			"question" : "Are you a <a href='http://www.thecommonwealth.org/Internal/191086/191247/142227/members/' target='_blank'>Commonwealth Citizen?</a>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 14 //4.2.1
				},
				{
					"answer" : "No",
					"next" : 15 //4.2.2
				}
			]
		},
		{//4.2.1 (14)
			"question" : "Do you have the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>right of abode</a> in the United Kingdom?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 11 //4.1
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				}
			]
		},
		{//4.2.2 (15)
			"question" : "Are you a citizen of one of the following EEA Countries <select><option>Austria</option><option>Belgium</option><option>Cyprus</option><option>Czech Republic</option><option>Denmark</option><option>Estonia</option><option>Finland</option><option>France</option><option>Germany</option><option>Greece</option><option>Hungary</option><option>Iceland</option><option>Ireland</option><option>Italy</option><option>Lativa</option><option>Liechtenstein</option><option>Lithuania</option><option>Luxembourg</option><option>Malta</option><option>The Netherlands</option><option>Norway</option><option>Poland</option><option>Slovakia</option><option>Slovenia</option><option>Spain</option><option>Sweden</option><option>Switzerland</option></select>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 16 //4.2.2.1
				},
				{
					"answer" : "No",
					"next" : 18 //4.2.2.2
				}
			]
		},
		{//4.2.2.1 (16)
			"question" : "Have you <a href='http://www.housing-rights.info/02_4_EEA_workers.php#EEA-workers' target='_blank'>worked</a> in the United Kingdom at any time – now or in the past?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 17 //4.2.2.1.1
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/applying_for_housing/1849/advice_and_help_for_eu_citizens"
				}
			]
		},
		{//4.2.2.1.1 (17)
			"question" : "Are you <a href='http://www.housing-rights.info/02_4_EEA_workers.php#EEA-workers' target='_blank'>working now, temporarily out of work or a retired worker?</a>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 21 //5
				},
				{
					"answer" : "No",
					"link" : " http://www.northampton.gov.uk/info/200183/applying_for_housing/1849/advice_and_help_for_eu_citizens"
				}
			]
		},
		{//4.2.2.2 (18)
			"question" : "Are you a citizen of <a href='http://www.housing-rights.info/02_8_Bulgarians_Romanians.php' target='_blank'>Bulgaria or Romania (A2 countries)</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 19 //4.2.2.2.1
				},
				{
					"answer" : "No",
					"next" : 20 //4.2.2.2.2
				}
			]
		},
		{//4.2.2.2.1 (19)
			"question" : "Are you currently working in the UK AND authorised to work? (or <a href='http://www.housing-rights.info/02_8_Bulgarians_Romanians.php' target='_blank'>exempt from authorisation</a>)",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 21 //5
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1779/citizenship_4"
				}
			]
		},
		{//4.2.2.2.2 (20)
			"question" : "Do you have one of the following status",
			"answers" : [
				{
					"answer" : "Refugee",
					"next" : 21 //5
				},
				{
					"answer" : "Humanitarian protection",
					"next" : 21 //5
				},
				{
					"answer" : "Discretionary leave to remain",
					"next" : 21 //5
				},
				{
					"answer" : "Exceptional leave to remain",
					"next" : 21 //5
				},
				{
					"answer" : "Limited Leave to remain",
					"next" : 21 //5
				},
				{
					"answer" : "Indefinite leave to remain",
					"next" : 21 //5
				},
				{
					"answer" : "An eligible family member of someone who has one of the above status",
					"next" : 21 //5
				},
				{
					"answer" : "An eligible family member an EU/EEA Citizen",
					"next" : 21 //5
				},
				{
					"answer" : "None of the above",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1780/citizenship_5"
				}
			]
		},
		{//5 (21)
			"question" : "Which of the following best describes your current housing situation?",
			"answers" : [
				{
					"answer" : "I/We are homeless",
					"info" : "<h3>Homeless</h3><p>You are homeless if you literally do not have a roof over your head but you may also be treated as homeless in other circumstances. Please see our <a href='http://www.northampton.gov.uk/info/200184/housing_options/239/homelessness' target='_blank'>homelessness pages for additional advice</a></p>",
					"next" : 22 //5.1
				},
				{
					"answer" : "I/We are staying temporarily with friends",
					"info" : "<h3>Homeless</h3><p>If you have no permanent home and have found yourself staying temporarily with different friends/others, perhaps on their floor or sofa or if lucky, a bed. Sometimes this is known as 'sofa surfing'. </p>",
					"next" : 22 //5.1
				},
				{
					"answer" : "I/We have a home but are unable to live in it due to fire, flood or other emergency",
					"next" : 22 //5.1
				},
				{
					"answer" : "I/We have somewhere to live at the moment but are likely to become homeless",
					"info" : "<h3>Threatened with Homeless</h3><p>You may be treated as Homeless if you are threatened with losing your home in the next 28 days.  This could include being discharged from hospital or supported housing, leaving the Armed Forces or released from Prison.You may also be threatened with homelessness if you need to leave your home, for example, being asked to leave, notice to quit, evicted, repossessed or risk of violence. Please see our <a href='http://www.northampton.gov.uk/info/200184/housing_options/239/homelessness' target='_blank'>homelessness pages for additional advice</a></p>",
					"next" : 24 //5.2
				},
				{
					"answer" : "I/We are living in temporary accommodation (e.g. Bed and Breakfast)",
					"next" : 22 //5.1
				},
				{
					"answer" : "I/We have somewhere to live but have nowhere to live together with my immediate family",
					"info" : "<h3>Immediate Family</h3><p>Spouse, civil partner or children</p>",
					"next" : 23 //5.1b
				},
				{
					"answer" : "I/We have somewhere to live and are not threatened with homelessness (not likely to become homeless",
					"next" : 28 //5.3 
				}
			]
		},
		{//5.1 (22)
			"question" : "Do you have any home anywhere in the UK or abroad?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1824/homelessness_advice_and_help"
				},
				{
					"answer" : "No",
					"next" : 35 //6A
				}
			]
		},
		{//5.1b (23)
			"question" : "Do you have any home that you can live in with your immediate family in the UK or abroad?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1824/homelessness_advice_and_help"
				},
				{
					"answer" : "No",
					"next" : 43 //6C
				}
			]
		},
		{//5.2 (24)
			"question" : "Do you have any of the following Armed Forces connections?",
			"answers" : [
				{
					"answer" : "I have been discharged from the Armed Forces within the last 5 years",
					"next" : 100, //app form
					"info" : "<h3>Armed Forces</h3><p>The Armed Forces are the Naval Service (including the Royal Navy and Royal Marines), the British Army and the Royal Air Force</p>"
				},
				{
					"answer" : "I am being discharged from the Armed Forces",
					"next" : 100, //app form
					"info" : "<h3>Armed Forces</h3><p>The Armed Forces are the Naval Service (including the Royal Navy and Royal Marines), the British Army and the Royal Air Force</p>"
				},
				{
					"answer" : "I am the spouse or civil partner of a recently deceased member of the Armed Forces",
					"next" : 100, //app form
					"info" : "<h3>Armed Forces</h3><p>The Armed Forces are the Naval Service (including the Royal Navy and Royal Marines), the British Army and the Royal Air Force</p>"
				},
				{
					"answer" : "Serving or have served in the <u>reserve</u> forces and are suffering from serious injury, illness or disability",
					"next" : 100, //app form
					"info" : "<h3>Reserve Forces</h3><p>The Territorial Army</p><h3>Injury, Illness or disability</h3><p>Any injury, illness or disability that is attributable wholly or partly to that service</p>"
				},
				{
					"answer" : "None of the above",
					"next" : 55 //5.2.1x
				}
			]
		},
		{//5.2.1 (25)
			"question" : "Do any of the following apply to you now or within the next 8 weeks?<ul><li>You have been given a <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>'Notice to Quit'</a></li><li>You have been <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>asked to leave</a> your home (but aren't leaving the Armed Forces)</li><li>You are being <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>evicted</a></li><li>Your property is being <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>repossessed</a></li><li>Your accommodation is being sold</li><li>You can no longer afford your accommodation</li><li>You are leaving a hostel or <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>temporary accommodation</a></li><li>You have nowhere to park your mobile home or houseboat</li><li>You have been asked to vacate your home due to a <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Compulsory Purchase Order (CPO)</a></li><li>You have been asked to leave your <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>'tied' accommodation</a></li><li>You have been asked to vacate your home as a result of <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>enforcement by the Local Authority</a></li></ul>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 35 //6A
				},
				{
					"answer" : "No",
					"next" : 26 //5.2.1.1
				}
			]
		},
		{//5.2.1.1 (26)
			"question" : "Do any of the following apply to you?",
			"answers" : [
				{
					"answer" : "You are you about to leave care or your foster placement is ending? ",
					"next" : 52 //10
				},
				{
					"answer" : "You are being discharged from hospital or supported housing and have nowhere to live or your accommodation is now unsuitable for you to live in",
					"next" : 27 //5.2.1.1.1  
				},
				{
					"answer" : "You are being released from prison and have nowhere to live",
					"next" : 27 //5.2.1.1.1 
				},
				{
					"answer" : "None of the above",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1824/homelessness_advice_and_help"
				}
			]
		},
		{//5.2.1.1.1 (27)
			"question" : "Have you been residing outside of the Borough of Northampton AND if so were you placed there through no choice of your own?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 39 //6B
				},
				{
					"answer" : "No",
					"next" : 35 //6A
				}
			]
		},
		{//5.3 (28)
			"question" : "Which of the following apply to you?",
			"answers" : [
				{
					"answer" : "I'm overcrowded in my home",
					"next" : 43, //6C
					"info" : "<h3>Overcrowding</h3><p>Statutory overcrowding as defined by Part X of Housing Act 1985 or a Court Order to re-house. <a href='http://www3.westminster.gov.uk/docstores/publications_store/overcrowding excerpt.pdf' target='_blank'>More information on overcrowding</a></p>"
				},
				{
					"answer" : "My home lacks basic facilities",
					"info" : "<h3>Basic Facilities</h3><p>Every Housing Authority needs to consider the Basic Housing needs of individuals</p><ul><li>Heating</li><li>Hot Water</li><li>Access to a toilet and washing facilities</li><li>A kitchen to include running water</li></ul>",
					"next" : 43 //6C
				},
				{
					"answer" : "I am sharing facilities with another household",
					"info" : "<h3>Sharing Facilities</h3><p>Sharing facilities could mean a living room, bathroom or kitchen.</p><p>Another Household is anyone who is not being included in your application. For example, if you are living at home with your parents and are applying for housing for yourself, or you renting a room in a shared house.",
					"next" : 30 //5.3.1X
				},
				{
					"answer" : "My accommodation is not suitable for medical reasons",
					"info" : "<h3>Medical Reasons</h3><p>Reasons due to illness or disability.</p>",
					"next" : 29 //5.3.1
				},
				{
					"answer" : "I need to move because of a risk to my welfare",
					"info" : "<h3>Risk to Welfare</h3><p>where there is a risk to the applicant’s (or someone to be housed with the applicant) welfare as a direct result of staying in the current accommodation and where a move to alternative accommodation would alleviate that risk</p>",
					"next" : 29 //5.3.1
				},
				{
					"answer" : "None of the above",
					"next" : 33 //9A
				}
			]
		},
		{//5.3.1 (29)
			"question" : "Do you need to move because you are suffering <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>severe harassment or violence</a> in your current accommodation?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1770/the_progress_of_your_housing_application_progress_4"
				},
				{
					"answer" : "No",
					"next" : 32 //5.3.1.1
				}
			]
		},
		{//5.3.1X (30)
			"question" : "Are you sharing facilities with your parent(s), brother(s) or sister(s)?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 31 //5.3.1X.1
				},
				{
					"answer" : "No",
					"next" : 43 //6C
				}
			]
		},
		{//5.3.1X.1 (31)
			"question" : "Are you applying for housing with any of the following",
			"answers" : [
				{
					"answer" : "A child or children who are under 16",
					"next" : 43 //6C
				},
				{
					"answer" : "Someone who is dependent on you for care",
					"next" : 43 //6C
				},
				{
					"answer" : "I am expecting a baby",
					"next" : 43 //6C
				},
				{
					"answer" : "None of the above",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/advice_and_help_for_people_seeking_social_housing"
				}
			]
		},
		{//5.3.1.1 (32)
			"question" : "Do any of the following apply to you?",
			"answers" : [
				{
					"answer" : "My accommodation is not suitable, or unreasonable to live in due to my medical needs",
					"info" : "<h3>Medical Needs</h3><p>Additional needs due to an illness or disability</p>",
					"next" : 43 //6C
				},
				{
					"answer" : "There is a serious risk to my health or wellbeing if I stay in my current accommodation",
					"next" : 43 //6C
				},
				{
					"answer" : "I need to move to be able to provide care for someone",
					"info" : "<h3>Care</h3><p>This can include group housing or paid carers either living in the property or calling to offer practical help</p>",
					"next" : 49 //9B
				},
				{
					"answer" : "I need to move to be able to receive care",
					"info" : "<h3>Care</h3><p>This can include group housing or paid carers either living in the property or calling to offer practical help</p>",
					"next" : 49 //9B
				},
				{
					"answer" : "I need to move to take up an employment or training opportunity",
					"info" : "<h3>Employment or Training Opportunity</h3><p>Employment or training is described as either working or undertaking work related training for 16 hours or more per week</p>",
					"next" : 43 //6C
				},
				{
					"answer" : "I have another specific medical or welfare reason for needing to move",
					"info" : "<h3>Medical or Welfare</h3><p>Reasons or concerns due to an illness or disability</p>",
					"next" : 43 //6C
				},
				{
					"answer" : "None of the above",
					"next" : 43 //6C
				}
			]
		},
		{//9A (33)
			"question" : "Are you an NBC Tenant or a Tenant of an NBC-partner <a href='http://www.northampton.gov.uk/info/100007/housing/1272/housing_associations' title='Housing Association List' target='_blank'>Housing Association</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 34 //9A.1
				},
				{
					"answer" : "No",
					"next" : 49 //9B
				}
			]
		},
		{//9A.1 (34)
			"question" : "Do any of the following apply to you?",
			"answers" : [
				
				{
					"answer" : "My property has been designated as ‘sheltered housing’ and I do not need and/or qualify for this facility",
					"info" : '<h3>Sheltered Housing</h3><p>Self-contained, purpose-built flats, houses or bungalows with their own front doors, kitchens and bathrooms aimed at people over 60 years of age. They are available for couples or single people and offer independent living with extra help if needed</p>',
					"next" : 43 //6C
				},
				{
					"answer" : "My property has been specially adapted and I no longer/do not need the adaptations",
					"info" : '<h3>Specially Adapted</h3><p>Specially adapted properties could include ramps for wheelchair access, bathrooms with wet rooms and handrails, stair-lifts etc</p>',
					"next" : 43 //6C
				},
				{
					"answer" : "I have been asked to move because my home requires major work within the next 6 weeks",
					"info" : '<h3>Major Works</h3><p>Major works to your property can include roofs, Windows, Structural works to walls, electrical rewiring</p>',
					"next" : 43 //6C
				},
				{
					"answer" : "I am a service tenant due to retire or have your contract of employment terminated",
					"info" : '<h3>Service Tenant</h3><p>Service tenants have had their housing provided to them by their employer, but it is not essential to live there in order to carry out the job (or the contract does not require you to live there).</p>',
					"next" : 43 //6C
				},
				{
					"answer" : "None of the above",
					"next" : 49 //9B
				}
			]
		},
		{//6A-Pre (35)
			"question" : "Do any of the following apply to you?<ul><li>Are you, or someone applying for housing with you, pregnant?</li><li>You have dependent children living with you who are still in full time education</li><li>You are 16 or 17 years old and have NOT been assessed as a <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>‘child in need’</a> by Childrens’ Services</li><li>You are <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>vulnerable</a>for example due to old age, ill health or a disability, fleeing violence or abuse or have been in care or fostered</li><li>You are homeless due to a fire, flood or other disaster</li><li>You are aged between 18-21 and were in care until you were 16</li></ul>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 36 //6A
				},
				{
					"answer" : "No",
					"next" : 43 //6C
				}
			]
		},
		{//6A (36)
			"question" : "Have you lived in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> for at least SIX out of the last TWELVE months or THREE out of the last FIVE years?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1781/homelessness_team"
				},
				{
					"answer" : "No",
					"next" : 37 //6A.1
				}
			]
		},
		{//6A.1 (37)
			"question" : "Do you work in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton?</a> <p>(You must be working for at least 16 hours a week for 9 out of the last 12 months to qualify.)</p>",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1781/homelessness_team"
				},
				{
					"answer" : "No",
					"next" : 38 //6A.1.1
				}
			]
		},
		{//6A1.1 (38)
			"question" : "Do you want to live near a close relative who has lived in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> for at least five years to be able to <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>provide care or receive support</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1781/homelessness_team"
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1824/homelessness_advice_and_help"
				}
			]
		},
		{//6B-Pre (39)
			"question" : "Do any of the following apply to you?<ul><li>Are you, or someone applying for housing with you, pregnant?</li><li>You have dependent children living with you who are still in full time eduction</li><li>You are 16 or 17 years old and have NOT been assessed as a <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>‘child in need’</a> by Childrens’ Services</li><li>You are <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>vulnerable</a></li><li>You are homeless due to a fire, flood or other disaster</li><li>You are aged between 18-21 and were in care until you were 16</li></ul>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 40 //6B
				},
				{
					"answer" : "No",
					"next" : 46 //6D
				}
			]
		},
		{//6B (40)
			"question" : "Did you or a joint applicant live in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> for at least 6 out of the last 12 months or 3 out of the last 5 years prior to leaving Northampton",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1781/homelessness_team"
				},
				{
					"answer" : "No",
					"next" : 41 //6B.1
				}
			]
		},
		{//6B.1 (41)
			"question" : "Did you or a joint applicant work in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> prior to leaving Northampton? <p>(You must have worked for at least 16 hours a week for 9 out of the last 12 months before you left Northampton to qualify.)</p>",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1781/homelessness_team"
				},
				{
					"answer" : "No",
					"next" : 42 //6B.1.1
				}
			]
		},
		{//6B.1.1 (42)
			"question" : "Do you or a joint applicant want to live near a close relative who has lived in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> for at least 5 years to be able to <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>provide care or receive support</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1781/homelessness_team"
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1824/homelessness_advice_and_help"
				}
			]
		},
		{//6C (43)
			"question" : "Have you lived in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> continuously for at least three years?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 52 //10
				},
				{
					"answer" : "No",
					"next" : 44 //6C.1
				}
			]
		},
		{//6C.1 (44)
			"question" : "Do you work in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton?</a> <p>(You must be working for at least 16 hours a week for 9 out of the last 12 months to qualify.)</p>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 52 //10
				},
				{
					"answer" : "No",
					"next" : 45 //6C1.1
				}
			]
		},
		{//6C1.1 (45)
			"question" : "Do you want to live near a close relative who has lived in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> for at least five years to be able to <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>provide care or receive support</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 52 //10
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				}
			]
		},
		{//6D (46)
			"question" : "Did you live in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> continuously for 3 years prior to leaving Northampton?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 100 //app form
				},
				{
					"answer" : "No",
					"next" : 47 //6D.1
				}
			]
		},
		{//6D.1 (47)
			"question" : "Did you work in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> prior to leaving Northampton? <p>(You must have worked for at least 16 hours a week for 9 out of the last 12 months before you left Northampton to qualify.)</p>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 52 //10
				},
				{
					"answer" : "No",
					"next" : 48 //6D.1.1
				}
			]
		},
		{//6D1.1 (48)
			"question" : "Do you or a joint applicant want to live near a close relative who has lived in the <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>Borough of Northampton</a> for at least 5 years to be able to <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>provide care or receive support</a>?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 52 //10
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				}
			]
		},
		{//9B (49)
			"question" : "Do you need to move to a larger home to accommodate a <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>'looked after'</a> child?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 50 //9B.1
				},
				{
					"answer" : "No",
					"next" : 51 //9B.2
				}
			]
		},
		{//9B.1 (50)
			"question" : "Which of the following apply to you?",
			"answers" : [
				{
					"answer" : "I have a fostering or adopting agreement in place",
					"info" : "<h3>Adoption Agreement</h3><p>An adopted child is one who has legally become the child of a parent or parents who are not the child's biological parents. To be legally recognised in the United Kingdom, the adoption must be made by order of a court or under the terms of the Hague Convention. A foreign adoption order will be recognised in the United Kingdom if it was made in a 'designated country' - a country included in the Adoption (Designation of Overseas Adoptions) Order 1973.</p><h3>Fostering Agreement</h3><p>An agreement between the fostering service and the foster carer which sets out matters such as terms of approval, the obligations of the foster carer, and what training and support the fostering service will provide for them. More information on what should be included in the Foster Care Agreement can be found In Schedule 5 of the Fostering Services (England) Regulations 2011.</p>",
					"next" : 43 //6C
				},
				{
					"answer" : "I am the special guardian, family carer or hold a residence order for a child whose parents are unable to provide care",
					"info" : "<h3>Special guardian / Family carer</h3><p>A special guardianship order gives parental responsibility to the special guardian, which they share with anyone else who has this. The order lasts until the child is 18, unless the court discharges it earlier.</p><p>Family and friends care is when a child is living full time with someone who is a family member, friend or was previously known to them. The majority of family and friends care is made up of informal arrangements between parents and relatives, but there are other situations and sometimes legal orders too. Where the child is looked after by a local authority and the family and friends carer is approved as their foster carer, this is known as family and friends foster care.</p><p>A Residence order is an order granted by the court which gives the holder parental responsibility for a child, although they share this with anyone else who has parental responsibilit</p>",
					"next" : 43 //6C
				},
				{
					"answer" : "None of the above",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				}
			]
		},
		{//9B.2 (51)
			"question" : "Do any the following apply to you?",
			"answers" : [
				{
					"answer" : "I have had an emergency move agreed by NBC",
					"info" : "emergency agreement description",
					"next" : 100 //app form
				},
				{
					"answer" : "I have had a 'move-on' agreed by NBC",
					"info" : "move-on description",
					"next" : 100 //app form
				},
				{
					"answer" : "I am part of a separte agreement by NBC",
					"info" : "separate agreement description",
					"next" : 100 //app form
				},
				{
					"answer" : "I have special needs and need help finding accommodation",
					"info" : "special needs description",
					"next" : 100 //app form
				},
				{
					"answer" : "None of the above",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				}
			]
		},
		{//10 (52)
			"question" : "Do you have more than £30,000 household <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>gross income</a> (for a single person household) or more than £50,000 <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>gross income</a> (for a family household)?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				},
				{
					"answer" : "No",
					"next" : 53 //10.1
				}
			]
		},
		{//10.1 (53)
			"question" : "Do you have more than £16,000 in <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>assets or savings</a> (single applicant) or more than £32,000 in <a href='http://www.northampton.gov.uk/info/200183/housing_allocations/1826/housing_application_process-glossary' target='_blank'>assets or savings</a> (joint applicants)?",
			"answers" : [
				{
					"answer" : "Yes",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1776/citizenship_2"
				},
				{
					"answer" : "No",
					"next" : 100 //app form
				}
			]
		},

		{//13(54)
			"question" : "Are you in rent arrears?",
			"answers" : [
			{"answer" : "Yes",
			"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1771/current_tenancy_1"
			},
			{
			"answer": "No",
			"next": 34 //9A.1
			}
			]
		},

		{//5.2.1x (55)
			"question" : "Are you living with parents?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 56 //5.2.1xa
				},
				{
					"answer" : "No",
					"next" : 25 //5.2.1
				}
			]
		},
		
		{//5.2.1xa (56)
			"question" : "Have they asked you to leave within 8 weeks?",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 57 //5.2.1xb
				},
				{
					"answer" : "No",
					"next" : 25 //5.2.1
				}
			]
		},
		
		
		{//5.2.1xb (57)
			"question" : "– Are you applying for housing with any of the following?<ul><li>A child or children under 16</li><li>Someone who is dependent on you for care</li><li>You are expecting a baby</li></ul>",
			"answers" : [
				{
					"answer" : "Yes",
					"next" : 36 //6a
				},
				{
					"answer" : "No",
					"link" : "http://www.northampton.gov.uk/info/200183/housing_allocations/1824/homelessness_advice_and_help"
				}
			]
		}
 

		
	];

	var app = new nbcApp.models.App()
	app.init(json,'container');
	ko.applyBindings(app);
})();