
//Basic data information.
var colorLightArr = ["#fed93f", "#1c8cff", "#13ff7c", "#ff4c4c"];
var onOffBtnId = "togglebtn";
var starBtnId = "start";
var strictBtnId = "strict";

//Command Names for Thread and other actions.
var userActionCheckerCommand = "userActionChecker";
var computerActionCommand = "computerAction";
var userActionCommand = "userAction";


//Messages on the Screen..
var ERROR_MSG = "Incorrect Move.";
var USER_TURN = "Your Turn.";
var COMPUTER_TURN = "Computer Turn.";
var ERROR_REPEAT = "Repeating Sequence.";
var TIME_OUT_ERROR = "User Action Time out.";
var GAME_STARTING = "Staring the game...";
var GAME_NOT_STARTED = "Game is not Started.";
var GAME_STOPPED = "Game stopped.";
var GAME_RESTARTING = "Restarting the Game.";
var GAME_PAUSE = "Game is paused.";
var GAME_WIN_MSG = "You have won the Game!";


//User action timeout in seconds. If reaches then stops the game.
var userActionTimeout = 5;
var delayNextAction = 500;
var delayForNextUser = 400;
var restartDelay = 2000;
var winStepsCount = 20;

//Global Game Controller Objects.
var simonGameApp = null;
var userActionObj = null;
var soundObj = null;
var isGamePause = false;
var jqeui 	 = jQuery.noConflict();

jqeui(function() {
	//Basic Properties..
	changeButtonsPointerEvent('unclickable', 'clickable');
	updateSessionInfo(GAME_NOT_STARTED);
	simonGameApp = new SimonGameApp();
	userActionObj = new UserAction(userActionTimeout);
	soundObj = new SoundHandler();
	
	jqeui('#' + starBtnId).on("click", function () {
		if (simonGameApp.isGameStart) {
			
			if (!simonGameApp.isGameRunning) {
				updateCssClass(starBtnId, 'btn-game-clicked', 'btn-game-unclicked');
				jqeui('#start-td').html("Restart");
				updateSessionInfo(GAME_STARTING);
				if (simonGameApp.startGameSequenceId) {
					clearInterval(simonGameApp.startGameSequenceId);
				}
				simonGameApp.startGameSequenceId = setInterval(computerActionThread, 1000);
				simonGameApp.isGameRunning = true;
				//User action checking thread.
				userActionObj.userActionCheckerId = setInterval(userActionCheckerThread, 1000);
			} else {
				//updateCssClass(starBtnId, 'btn-game-unclicked', 'btn-game-clicked');
				//stopGame();
				updateSessionInfo(GAME_PAUSE);
				killRunnginThreads();
				confirmNRestartGame();
			}
			
		} else {
			alert('Please turn on the game first.','error');
		}
		
	});
	jqeui('#' + strictBtnId).on("click", function () {
		if (!simonGameApp.isStrictMode) {
			simonGameApp.isStrictMode = true;
			updateCssClass(strictBtnId, 'btn-game-clicked', 'btn-game-unclicked');
		} else {
			simonGameApp.isStrictMode = false;
			updateCssClass(strictBtnId, 'btn-game-unclicked', 'btn-game-clicked');
		}
		
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
		size:'small'
	 });
	
	jqeui('#'+ onOffBtnId).change(function() {
		if (!jqeui(this).prop('checked')) {
			stopGame();
			simonGameApp.isGameStart = false;
			jqeui('#cnt_id').val('');
		} else {
			resetGame();
			simonGameApp.isGameStart = true;
			jqeui('#cnt_id').val('--');
		}
	});
});
function killRunnginThreads() {
	clearInterval(simonGameApp.startGameSequenceId);
	clearInterval(userActionObj.userActionCheckerId);
}
function startThreads() {
	simonGameApp.startGameSequenceId = setInterval(computerActionThread, 1000);
	userActionObj.userActionCheckerId = setInterval(userActionCheckerThread, 1000);
}
function restartGame() {
	isGamePause = true;
	resetGame();
	updateSessionInfo(GAME_RESTARTING);
	setTimeout( function() {
		isGamePause = false;
	}, restartDelay);
}
function confirmNRestartGame () {
	isGamePause = true;
	jqeui( "#dialog-confirm" ).dialog({
	      resizable: false,
	      height: "auto",
	      width: 400,
	      modal: true,
	      buttons: {
	        "Restart": function() {
	        	restartGame();
	        	startThreads();
	        	jqeui( this ).dialog( "close" );
	        },
	        Cancel: function() {
	          isGamePause = false;
	          startThreads();
	          jqeui( this ).dialog( "close" );
	        }
	      }
	    });
}
function stopGame() {
	updateSessionInfo(GAME_STOPPED);
	updateCssClass(starBtnId, 'btn-game-unclicked', 'btn-game-clicked');
	jqeui('#start-td').html("Start");
	killRunnginThreads();
	resetGame();
}
function updateSessionInfo(msg) {
	var sessionInfo = null;
	if (msg) {
		sessionInfo = msg;
	} else {
		if (!simonGameApp.isGameLock && !simonGameApp.isErrorLoop) {
			sessionInfo = USER_TURN;
		} else if (simonGameApp.isGameLock && !simonGameApp.isErrorLoop) {
			sessionInfo = COMPUTER_TURN;
		}
	}
	
	if (sessionInfo) {
		jqeui('#current_session_id').html(sessionInfo);
	}
}
function updateCssClass(elementId, newCssClass, oldCssClass) {
	var elementObj = jqeui('#' + elementId);
	if (oldCssClass) {
		elementObj.removeClass(oldCssClass);
	}
	elementObj.addClass(newCssClass);
}
function changeButtonsPointerEvent(cssClassName, oldClassName) {
	updateCssClass('1', cssClassName, oldClassName);
	updateCssClass('2', cssClassName, oldClassName);
	updateCssClass('3', cssClassName, oldClassName);
	updateCssClass('4', cssClassName, oldClassName);
}
function resetGame() {
	jqeui('#cnt_id').val("--");
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
	if (!isGamePause) {
		if (callerCommand === computerActionCommand) {
			/**
			 * Steps are if the userPress is false.
			 * 1. Get Random number.
			 * 2. Push the sequnce number into array.
			 * 3. Increment count.
			 * 4. Display the updated count.
			 * 4. Press the button for the received sequence number.
			 */
			if (simonGameApp.isGameLock && !simonGameApp.isErrorLoop) {
				simonGameApp.isComputerActionLoop = true;
				setTimeout(function() {
						var randomNumber = Math.floor((Math.random()*4) + 1);
						simonGameApp.pushSequence.push(randomNumber);
						simonGameApp.currentStep++;
						displayUpdatedCount();
						pressCompleteSequence();
						makeGameAvailableForUser(true);
				}, delayForNextUser);
			}
		} else if (callerCommand === userActionCheckerCommand) {
			if (!simonGameApp.isGameLock) {
				if (userActionObj.isUserActionTimeout() && !simonGameApp.isErrorLoop) {
					updateSessionInfo(TIME_OUT_ERROR);
					raiseErrorNRepeat();
				}
			}
		} else if (callerCommand === userActionCommand) {
			changeButtonsPointerEvent('unclickable', 'clickable');
			updateUserActionStartTime();
			pressButton(numberClicked, -1, false);
			
			//This delay to make the clicking completes. Otherwise, the button is not going back to its normal behaviour.
			setTimeout(function() {
				if(!userActionObj.isValidPress(numberClicked, simonGameApp.pushSequence)) {
					updateSessionInfo(ERROR_MSG);
					userActionObj.resetObject();
					raiseErrorNRepeat();
					return;
				} else {
					changeButtonsPointerEvent('clickable', 'unclickable');
				}
				
				if(userActionObj.isClickingCompleted(simonGameApp.pushSequence)) {
					simonGameApp.isGameLock = true;
					changeButtonsPointerEvent('unclickable', 'clickable');
					if(userActionObj.userPressSequenceArr.length === winStepsCount) {
						isGamePause = true;
						updateSessionInfo(GAME_WIN_MSG);
						setTimeout(function() {
							restartGame();
							isGamePause = false;
						}, 5000);
					} else {
						userActionObj.resetObject();
					}
				}
			}, delayNextAction);
			
		} else {
			alert('Invalid Command.','error');
		}
		updateSessionInfo();
	} else {
		
	}
}
function updateUserActionStartTime() {
	userActionObj.lastActionDate = new Date();
}
function getDelayNextAction(isRepeat) {
	var multiplier = 1;
	if (isRepeat) {
		multiplier = 2;
	}
	return (simonGameApp.pushSequence.length * delayNextAction * multiplier);
}

function raiseError() {
	//alert(">> Incorrect sequence..");
	soundObj.playError();
}
function pressCompleteSequence() {
	repeatClick(0, true);
}
function repeatClick(ind, isRepeat) {
	if (ind < simonGameApp.pushSequence.length) {
		pressButton(simonGameApp.pushSequence[ind], ind, isRepeat);
	}
}
function pressButton(buttonNumber, ind, isRepeat) {
	if (!isGamePause) {
		var oldColor = jqeui('#'+ buttonNumber).css('background-color');
		jqeui('#'+ buttonNumber).css('background-color', colorLightArr[buttonNumber-1]);
		soundObj.playBeep(buttonNumber);
		setTimeout(function() {
			jqeui('#'+ buttonNumber).css('background-color', oldColor);
			if(isRepeat) {
				setTimeout(function() {
					repeatClick(ind+1, isRepeat);
					}, delayNextAction);
			}
		}, delayNextAction);
	}
}
function raiseErrorNRepeat() {
	changeButtonsPointerEvent('unclickable', 'clickable');
	simonGameApp.isGameLock = true;
	simonGameApp.isErrorLoop = true;
	raiseError();
	
	if (!simonGameApp.isStrictMode) {
		//To start the repeating of the clicks after some delay. Otherwise, after user wrong click, it is starting the repeat quickly.
		setTimeout(function() {
				updateSessionInfo(ERROR_REPEAT);
				pressCompleteSequence();
				makeGameAvailableForUser(true);
		}, 500);
	} else {
		restartGame();
	}
}
function makeGameAvailableForUser(isRepeatSeq) {
	var timeOut = getDelayNextAction(true);
	setTimeout(function() {
		enableUserAction();
		removeErrorLoop();
		removeComputerActionLoop();
		updateUserActionStartTime();
		changeButtonsPointerEvent('clickable', 'unclickable');
	}, timeOut);
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
	};
	this.getCountString = function() {
		if (this.currentStep < 10) {
			return "0"+ this.currentStep;
		}
		return this.currentStep;
	}
};
/**
 * Object to holds User actions.
 */
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
/**
 * Sound Playing Object.
 * @constructor
 */
var SoundHandler = function () {
	
	var redSoundId = new Audio('https://github.com/ymohammad/simon_game/blob/master/audio/simonSound1.mp3?raw=true');
	var blueSoundId = new Audio('https://github.com/ymohammad/simon_game/blob/master/audio/simonSound2.mp3?raw=true');
	var greenSoundId = new Audio('https://github.com/ymohammad/simon_game/blob/master/audio/simonSound3.mp3?raw=true');
	var yellowSoundId = new Audio('https://github.com/ymohammad/simon_game/blob/master/audio/simonSound4.mp3?raw=true');
	
	var errorTone = new Audio('https://github.com/ymohammad/simon_game/blob/master/audio/error.mp3?raw=true');
							   
	this.playBeep = function(buttonNumber) {
		if (buttonNumber === 1) {
			redSoundId.play();
		}
		else if (buttonNumber === 2) {
			blueSoundId.play();
		}
		else if (buttonNumber === 3) {
			greenSoundId.play();
		}
		else if (buttonNumber === 4) {
			yellowSoundId.play();
		}
	};
	
	this.playError = function() {
		errorTone.play();
	};
};