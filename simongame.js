var colorLightArr = ["#fed93f", "#1c8cff", "#13ff7c", "#ff4c4c"];
var onOffBtnId = "togglebtn";
var starBtnId = "start";
var strictBtnId = "strict";
var userActionCheckerCommand = "userActionChecker";
var computerActionCommand = "computerAction";
var userActionCommand = "userAction";
//User action timeout in seconds. If reaches then stops the game.
var userActionTimeout = 30;
var simonGameApp = null;
var userActionObj = null;

var jqeui 	 = jQuery.noConflict();
jqeui(function() {
	//Basic Properties..
	changeButtonsPointerEvent('unclickable', 'clickable');
	simonGameApp = new SimonGameApp();
	userActionObj = new UserAction(userActionTimeout);
	
	jqeui('#' + starBtnId).on("click", function () {
		if (simonGameApp.isGameStart) {
			
			if (!simonGameApp.isGameRunning) {
				jqeui(this).css('background-color', 'red');
				jqeui(this).css('transform','scale(0.9)');
				if (simonGameApp.startGameSequenceId) {
					clearInterval(simonGameApp.startGameSequenceId);
				}
				simonGameApp.startGameSequenceId = setInterval(computerActionThread, 1000);
				simonGameApp.isGameRunning = true;
				//User action checking thread.
				//userActionObj.userActionCheckerId = setInterval(userActionCheckerThread, 500);
			} else {
				jqeui(this).css('background-color', 'yellow');
				jqeui(this).css('transform','scale(0)');
				resetGame();
			}
			
		} else {
			alert('Please turn on the game first.','error');
		}
		
	});
	jqeui('#' + strictBtnId).on("click", function () {
		simonGameApp.isStrictMode = true;
	});

	jqeui('#1').on('click', function() {
		gameController(userActionCommand, 1);
	});
	jqeui('#2').on('click', function() {
		gameController(userActionCommand, 2);
	});
	jqeui('#3').on('click', function() {
		gameController(userActionCommand, 3);
	});
	jqeui('#4').on('click', function() {
		gameController(userActionCommand, 4);
	});
	
	jqeui('#'+ onOffBtnId).bootstrapToggle({
		size:'mini'
	 });
	
	jqeui('#'+ onOffBtnId).change(function() {
		simonGameApp.isGameStart = jqeui(this).prop('checked');
		if (!jqeui(this).prop('checked')) {
			resetGame();
		}
	});
});
function changeButtonsPointerEvent(cssClassName, oldClassName) {
	if (oldClassName) {
		jqeui('#1').removeClass(oldClassName);
		jqeui('#2').removeClass(oldClassName);
		jqeui('#3').removeClass(oldClassName);
		jqeui('#4').removeClass(oldClassName);
	}
	
	jqeui('#1').addClass(cssClassName);
	jqeui('#2').addClass(cssClassName);
	jqeui('#3').addClass(cssClassName);
	jqeui('#4').addClass(cssClassName);
}
function resetGame() {
	simonGameApp.resetGame();
	userActionObj.resetObject();
}
function computerActionThread() {
	if (!simonGameApp.isComputerActionLoop) {
		
		gameController(computerActionCommand);
	}
}
function userActionCheckerThread() {
	gameController(userActionCheckerCommand);
}
function displayUpdatedCount() {
	jqeui('#cnt_id').val(simonGameApp.getCountString());
}
/**
 * Basic game controller which will be called from all the places.
 * @param callerName
 * @param numberClicked
 */
function gameController(callerCommand, numberClicked) {
	if (callerCommand === computerActionCommand) {
		/**
		 * Steps are if the userPress is false.
		 * 1. Get Random number.
		 * 2. Push the sequnce number into array.
		 * 3. Increment count.
		 * 4. Display the updated count.
		 * 4. Press the button for the received sequence number.
		 */
		if (simonGameApp.isGameLock) {
			simonGameApp.isComputerActionLoop = true;
			var randomNumber = Math.floor((Math.random()*4) + 1);
			simonGameApp.pushSequence.push(randomNumber);
			simonGameApp.currentStep++;
			displayUpdatedCount();
			
			pressCompleteSequence();
			//var timeOut = simonGameApp.pushSequence.length * 500;
			var timeOut = 500;
			setTimeout(enableUserAction, timeOut);
			setTimeout(removeComputerActionLoop, timeOut);
			setTimeout(function () {
				userActionObj.lastActionDate = new Date();
			}, timeOut);
			setTimeout(function() {
				changeButtonsPointerEvent('clickable', 'unclickable');
			}, timeOut);
		}
	} else if (callerCommand === userActionCheckerCommand) {
		if (!simonGameApp.isGameLock) {
			if (userActionObj.isUserActionTimeout() && !simonGameApp.isErrorLoop) {
				raiseErrorNRepeat();
			}
		}
	} else if (callerCommand === userActionCommand) {
		userActionObj.lastActionDate = new Date();
		pressButton(numberClicked, -1, false);
		setTimeout(function() {
			if(!userActionObj.isValidPress(numberClicked, simonGameApp.pushSequence)) {
				userActionObj.resetObject();
				raiseErrorNRepeat();
				return;
			} 
			
			if(userActionObj.isClickingCompleted(simonGameApp.pushSequence)) {
				simonGameApp.isGameLock = true;
				changeButtonsPointerEvent('unclickable', 'clickable');
				userActionObj.resetObject();
			}
		}, 1250);
		
	} else {
		alert('Invalid Command.','error');
	}
	updateSessionInfo();
}
function updateSessionInfo() {
	var sessionInfo = "Computer Turn";
	if (!simonGameApp.isGameLock) {
		sessionInfo = "User Turn";
	}
	jqeui('#current_session_id').html(sessionInfo);
}
function pressButton(buttonNumber, ind, isRepeat) {
	var oldColor = jqeui('#'+ buttonNumber).css('background-color');
	jqeui('#'+ buttonNumber).css('background-color', colorLightArr[buttonNumber-1]);
	//jqeui('#'+ buttonNumber).css('background-color', oldColor);
	setTimeout(function() {
		jqeui('#'+ buttonNumber).css('background-color', oldColor);
		if(isRepeat) {
			repeatClick(ind+1, isRepeat);
		}
	}, 500);
}
function raiseError() {
	alert(">> Incorrect sequence..");
}
function pressCompleteSequence() {
	repeatClick(0, true);
	/*for (var x=0; x < this.pushSequence.length; x++) {
		setTimeout(this.pressButton(this.pushSequence[x]), 1500);
	}*/
}
function repeatClick(ind, isRepeat) {
	if (ind < simonGameApp.pushSequence.length) {
		pressButton(simonGameApp.pushSequence[ind], ind, isRepeat);
	}
}
function raiseErrorNRepeat() {
	changeButtonsPointerEvent('unclickable', 'clickable');
	simonGameApp.isErrorLoop = true;
	raiseError();
	if (!simonGameApp.isStrictMode) {
		pressCompleteSequence();
		setTimeout(enableUserAction, simonGameApp.pushSequence.length * 1500);
		setTimeout(removeErrorLoop, simonGameApp.pushSequence.length * 1500);
		setTimeout(function() {
			changeButtonsPointerEvent('clickable', 'unclickable');
		}, simonGameApp.pushSequence.length * 1500);
	}
}
function removeComputerActionLoop() {
	simonGameApp.isComputerActionLoop = false;
}
function removeErrorLoop() {
	simonGameApp.isErrorLoop = false;
}
function enableUserAction () {
	simonGameApp.isGameLock = false;
}
/**
 * It is the SimonGame object which performs Simon game.
 */
var SimonGameApp = function() {

	//true - waiting for computer action otherwise user action.
	this.isGameLock = true; 
	this.isErrorLoop = false;
	this.isGameRunning = false;
	this.isComputerActionLoop = false;
	this.currentStep = 0;
	this.pushSequence = [];
	this.isStrictMode = false;
	this.isGameStart = false;
	this.startGameSequenceId = null;
	
	this.resetGame = function() {
		this.isGameLock = true; 
		this.isErrorLoop = false;
		this.isGameRunning = false;
		this.isComputerActionLoop = false;
		this.currentStep = 0;
		this.pushSequence = [];
		this.isStrictMode = false;
		this.isGameStart = false;
		if (this.startGameSequenceId) {
			clearInterval(this.startGameSequenceId);
		}
		this.startGameSequenceId = null;
	};
	this.getCountString = function() {
		if (this.currentStep < 10) {
			return "0"+ this.currentStep;
		}
		return this.currentStep;
	}
};

var UserAction = function(timeOutInterval) {
	this.lastActionDate = null;
	this.userClickIndex = 0;
	this.timeOutInterval = timeOutInterval;
	this.userActionCheckerId = null;
	this.userPressSequenceArr = [];
	
	this.resetObject = function() {
		this.userClickIndex = 0;
		this.lastActionDate = null;
		this.userPressSequenceArr = [];
		/*if (this.userActionCheckerId) {
			clearInterval(this.userActionCheckerId);
		}*/
		//this.userActionCheckerId = null;
	};
	/**
	 * Validates if the user click matches the system pressed numbers.
	 */
	this.isValidPress = function(userPressNumber, computerSeq) {
		var result = false;
		//var index = this.userPressSequenceArr.length;
		if (computerSeq[this.userClickIndex] === userPressNumber) {
			this.userPressSequenceArr.push(userPressNumber);
			this.userClickIndex++;
			result = true;
		}
		return result;
	};
	/**
	 * Checks if the user action timed out or not.
	 */
	this.isUserActionTimeout = function () {
		var result = false;
		if (this.lastActionDate) {
			var endDate = new Date();
			var timeTaken = (endDate.getTime() - this.lastActionDate.getTime())/1000;
			if (timeTaken >= this.timeOutInterval) {
				result = true;
			}
		} else {
			this.lastActionDate = new Date();
		}
		return result;
	};
	
	this.isClickingCompleted = function(computerSeqArr) {
		var result = false;
		if (computerSeqArr.length === this.userPressSequenceArr.length) {
			result = true;
		}
		return result;
	};
};