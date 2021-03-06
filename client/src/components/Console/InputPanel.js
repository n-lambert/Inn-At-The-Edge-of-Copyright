import {
    MobileView,
    BrowserView
} from 'react-device-detect';
import { useAuth0 } from "@auth0/auth0-react";

import findIn, { takeTheseOffThat, getOneOfTheseOffThat } from "../../clientUtilities/finders";
import { useEffect } from 'react';
import socket from "../../clientUtilities/socket";
import { getItem, dropItem } from "./js/getDrop";
import { giveItem } from './js/give';
import { juggle, stopJuggling } from "./js/juggle";
import { startDisableInputTimer, startShoutTimer } from "./js/timers";
import { wear, remove } from "./js/wearRemove";
import { showStats } from "./js/stats";
import { showInventory } from "./js/inventory";
import NPCCheck from "../../clientUtilities/NPCChecks";
import discoverableFunctions from "../../clientUtilities/discoverablesFunctions";
import { lookAbout } from './js/look';
import { attackCreature } from "./js/monsters";
import processMove from './js/move';
import runExamine from './js/examine';
import eatItem from './js/eat';
import runQuests from "./js/quests";

//set up index for current position in userCommandsHistory
let inputHistoryIndex;
//constant variables for parsing

function InputPanel({
    // Props being handed to the input by the console component
    onBlur,
    onSelect,
    minState,
    input,
    setInput,
    inputHistory,
    setInputHistory,
    actionCalls,
    user,
    setPlayer,
    setPlayerPosition,
    playerPosition,
    setChatHistory,
    location,
    activities,
    setActivities,
    inConversation,
    setConversation,
    muted,
    setMuted,
    canReply,
    day,
    suggestion
}) {

    const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
    const authUser = useAuth0().user;

    useEffect(() => {
        isAuthenticated && socket.emit("log in", authUser.sub);
        // isAuthenticated && console.log(authUser.email);
        if (!(authUser === undefined)) {
            console.log(authUser.sub);
            (!(authUser.characterName === undefined)) && console.log("authUser: " + authUser.characterName);
        }
        // es-lint-ignore-next-line
    }, [isAuthenticated])
    //update currentMessage in gameinfo based on input bar change
    const onInputBarChange = (e) => {
        setInput(e.target.value);
    }

    // console.log(user);

    socket.off('YouCanLogIn').on('YouCanLogIn', () => {
        socket.emit("log in", authUser.email);
    })

    //action on enter key
    const handleMessage = (event) => {
        try {
            event.preventDefault();

            let enteredInput = input
            // This is a slow function and occasionally the input variable is already modified by the time
            // this function runs, so it must be set to a different variable to avoid async issues
            setInputHistory(prevState => [...prevState, enteredInput])

            let discoverableCommands = [];
            if (location.current && location.current.discoverables) {
                location.current.discoverables.forEach(discObj => {
                    if (discObj.commands) {
                        discObj.commands.forEach(command => discoverableCommands.push(command))
                    }
                })
            }

            ////////////////////////////////
            //                            //
            //        USER ACTIONS        //
            //                            //
            //    permissable in convo    //
            ////////////////////////////////

            if (user.characterName === undefined) {
                /////////////////////
                //  PROMPT LOG IN  //
                /////////////////////
                if (findIn(input, ["log in", "logon", "login", "log on"])) {
                    loginWithRedirect();
                    // let message = takeTheseOffThat(["log in", "logon", "login", "log on"], input);
                } else {
                    socket.emit("log in", "You must log in first! Type 'log in [username]'");
                }
            } else if (user.characterName === "newUser") {
                /////////////////////
                //    NEW USER     //
                /////////////////////
                // console.log('Emit newUser')
                socket.emit('newUser', { input, email: authUser.email });
            } else if (
                findIn(input, discoverableCommands) ||
                findIn(input.replace(/( the | a | an | that )/, ' '), discoverableCommands)
            ) {
                /////////////////////
                //  DISCOVERABLES  //
                /////////////////////
                input = input.replace(/( the | a | an | that )/, ' ')
                let command = getOneOfTheseOffThat(discoverableCommands, input);
                let foundDisc = location.current.discoverables.find(discObj => {
                    if (discObj.commands) {
                        return discObj.commands.includes(command)
                    }
                })
                if (foundDisc.actionDescription) {
                    setChatHistory(prevState => [...prevState, { type: "displayed-stat faded mt-3", text: foundDisc.actionDescription }]);
                }
                if (foundDisc.action) {
                    input = takeTheseOffThat(discoverableCommands.concat(['the', 'a', 'an', "that"]), input).toLowerCase().trim();
                    discoverableFunctions[location.current.locationName][foundDisc.action]({ isSleeping: activities.sleeping, socket, location, user, input, playerPosition, setChatHistory, actionCalls, command });
                }
            } else if (findIn(input, actionCalls.reply)) {
                /////////////////////
                //      REPLY      //
                /////////////////////
                if (canReply) {
                    let message = canReply.to + ' ' + takeTheseOffThat(actionCalls.reply, input)
                    socket.emit('whisper', { message, userData: user })
                } else {
                    setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: "You have nobody to reply to!" }]);
                }
            } else if (findIn(input, actionCalls.whisper)) {
                /////////////////////
                //    WHISPER      //
                /////////////////////
                let message = takeTheseOffThat(actionCalls.whisper, input);

                NPCCheck(location.current.NPCs, message)
                    .then(({ NPCName, message }) => {
                        socket.emit('to NPC', { toNPC: NPCName, message, user, route: inConversation.route })
                    })
                    .catch(() => {
                        // This runs if the entered character is not an NPC
                        // fyi, checking if the message begins with someone's name is handled on the server side
                        socket.emit('whisper', { message, userData: user })
                    })
            } else if (findIn(input, actionCalls.inventory)) {
                /////////////////////
                //    INVENTORY    //
                /////////////////////
                // let inventory = takeTheseOffThat(actionCalls.inventory, input)
                showInventory(user, setChatHistory);
            } else if (findIn(input, actionCalls.quests)) {
                /////////////////////
                //     QUESTS      //
                /////////////////////
                let inputtedQuest = takeTheseOffThat(actionCalls.quests, input).trim().toLowerCase();
                runQuests({ user, input: inputtedQuest, setChatHistory, socket });

            } else if (findIn(input, actionCalls.juggle)) {
                /////////////////////
                //     JUGGLE      //
                /////////////////////
                juggle(input, user, location.current.locationName);
            } else if (input.toLowerCase() === "stop juggling") {
                stopJuggling(user.characterName, true);
            } else if (findIn(input, actionCalls.stats)) {
                /////////////////////
                //      STATS      //
                /////////////////////
                showStats(user, setChatHistory, actionCalls.stats, input);
            } else if (findIn(input, actionCalls.help)) {
                /////////////////////
                //      HELP       //
                /////////////////////
                let help = takeTheseOffThat(actionCalls.help, input);
                socket.emit('help', { message: help });
            } else if (findIn(input, actionCalls.position)) {
                /////////////////////
                //    POSITION     //
                /////////////////////
                let command = getOneOfTheseOffThat(actionCalls.position, input);
                if (!activities.sleeping) {
                    if (findIn(command, ['lie', 'lay']) && playerPosition !== 'lying down') {
                        setPlayerPosition('lying down');
                        setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You are now lying down.` }]);
                    } else if (findIn(command, ['sit']) && playerPosition !== 'sitting') {
                        setPlayerPosition('sitting');
                        setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You are now sitting.` }]);
                    } else if (findIn(command, ['stand']) && playerPosition !== 'standing') {
                        setPlayerPosition('standing');
                        setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You are now standing.` }]);
                    } else if (findIn(command, ['get up'])) {
                        // console.log(playerPosition)
                        if (playerPosition === 'lying down') {
                            setPlayerPosition('sitting')
                            setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You are now sitting.` }]);
                        } else if (playerPosition === 'sitting') {
                            setPlayerPosition('standing')
                            setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You are now standing.` }]);
                        } else if (playerPosition === 'standing') {
                            setChatHistory(prevState => [...prevState, { type: "displayed-green", text: `You are already ${playerPosition}` }]);
                        }
                    } else if (findIn(command, ['position', 'get position'])) {
                        setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You are ${playerPosition}` }]);
                    } else {
                        setChatHistory(prevState => [...prevState, { type: "displayed-green", text: `You are already ${playerPosition}` }]);
                    }
                } else if (findIn(command, ['position', 'get position'])) {
                    setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You are ${playerPosition} and are asleep` }]);
                } else {
                    setChatHistory(prevState => [...prevState, { type: "displayed-error", text: `You need to be awake to do that` }]);
                }



                ////////////////////////////////
                //                            //
                //   OUT OF CONVO ACTIONS     //
                //                            //
                ////////////////////////////////



            } else if (!inConversation) {
                // Everything in here cannot be run while in a conversation with an NPC
                // if (findIn(input, DiscoverableCalls.get(location.current.locationName))) {
                //     console.log('something discoverable is happening');
                // } else 
                if (findIn(input, actionCalls.sleep)) {
                    /////////////////////
                    //      SLEEP      //
                    /////////////////////
                    if (activities.sleeping) {
                        setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `You are already sleeping.` }]);
                    } else if (playerPosition === "lying down") {
                        socket.emit('sleep', { userToSleep: user.characterName, location: location.current.locationName });
                    } else {
                        setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `You need to lie down to do that!` }]);
                    }
                    // socket.emit('sleep', input)

                } else if (findIn(input, actionCalls.move)) {
                    /////////////////////
                    //      MOVE       //
                    /////////////////////
                    let command = getOneOfTheseOffThat(actionCalls.move, input)
                    processMove(socket, location, user, input, playerPosition, setChatHistory, actionCalls, command);

                } else if (findIn(input, actionCalls.speak)) {
                    /////////////////////
                    //     SPEAK       //
                    /////////////////////
                    const message = takeTheseOffThat(actionCalls.speak, input);
                    socket.emit('speak', { message, user: user.characterName, location: location.current.locationName });

                } else if (findIn(input, actionCalls.shout)) {
                    /////////////////////
                    //     SHOUT       //
                    /////////////////////
                    const command = getOneOfTheseOffThat(actionCalls.shout, input.toLowerCase());
                    if (!muted) {
                        const message = takeTheseOffThat(actionCalls.shout, input)
                        if (message.trim() !== "") {
                            startShoutTimer(setMuted)
                            socket.emit('shout', { location: user.lastLocation, fromUser: user.characterName, message })
                        } else {
                            setChatHistory(prevState => [...prevState, { type: "displayed-error", text: `Looks like you didn't ${command} anything! Try ${command} [your message here]` }]);
                        }
                    } else {
                        if (muted.secondsLeft !== undefined) {
                            setChatHistory(prevState => [...prevState, { type: "displayed-error", text: `You cannot ${command} for ${muted.secondsLeft} more seconds` }]);
                        } else {
                            setChatHistory(prevState => [...prevState, { type: "displayed-error", text: `You cannot ${command} for 10 more seconds` }]);
                        }
                    }
                    // console.log(user)
                } else if (findIn(input, actionCalls.examine)) {
                    /////////////////////
                    //     EXAMINE     //
                    /////////////////////
                    let toExamine = takeTheseOffThat(actionCalls.examine, input.toLowerCase());
                    const command = getOneOfTheseOffThat(actionCalls.examine, input.toLowerCase());
                    toExamine = takeTheseOffThat(['the', 'a', 'an'], toExamine)
                    runExamine({ input, location, command, toExamine, user, setChatHistory });

                } else if (findIn(input, actionCalls.look)) {
                    /////////////////////
                    //      LOOK       //
                    /////////////////////
                    lookAbout(location, setChatHistory, day);

                } else if (findIn(input, actionCalls.get)) {
                    /////////////////////
                    //      GET        //
                    /////////////////////
                    const target = takeTheseOffThat(actionCalls.get, input);
                    getItem(socket, user, target, location);

                } else if (findIn(input, actionCalls.drop)) {
                    /////////////////////
                    //      DROP       //
                    /////////////////////
                    const target = takeTheseOffThat(actionCalls.drop, input);
                    dropItem(socket, location, target, user);

                } else if (findIn(input, actionCalls.wear)) {
                    /////////////////////
                    //      WEAR       //
                    /////////////////////
                    wear(input, user, actionCalls.wear);

                } else if (findIn(input, actionCalls.remove)) {
                    /////////////////////
                    //     REMOVE      //
                    /////////////////////
                    remove(input, user, actionCalls.remove);

                } else if (findIn(input, actionCalls.emote)) {
                    /////////////////////
                    //      EMOTE      //
                    /////////////////////
                    let command = getOneOfTheseOffThat(actionCalls.emote, input)
                    const emoteThis = takeTheseOffThat(actionCalls.emote, input);
                    if (emoteThis.trim() !== '') {
                        socket.emit('emote', { user: user.characterName, emotion: emoteThis, location: location.current.locationName });
                    } else {
                        setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `Looks like you didn't emote anything! Try ${command} runs around wildly` }]);
                    }

                } else if (findIn(input, actionCalls.wake)) {
                    /////////////////////
                    //      WAKE       //
                    /////////////////////
                    if (!activities.sleeping) {
                        setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `You are already awake!` }]);
                    } else {
                        socket.emit('wake', { userToWake: user.characterName, location: location.current.locationName })
                    }

                } else if (findIn(input, actionCalls.give)) {
                    /////////////////////
                    //      GIVE       //
                    /////////////////////
                    let inputString = takeTheseOffThat(actionCalls.give, input);
                    let item = inputString.split(" to ")[0];
                    let target = takeTheseOffThat([item], inputString);
                    target = takeTheseOffThat(["to"], target);
                    giveItem(socket, item, target, user, location);

                } else if (findIn(input, actionCalls.attack)) {
                    /////////////////////
                    //     ATTACK      //
                    /////////////////////
                    // console.log(activities);
                    if (!(playerPosition === 'standing')) {
                        setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `You should probably stand up to do that.` }]);
                    } else {
                        let target = takeTheseOffThat(actionCalls.attack, input).toLowerCase();
                        target = takeTheseOffThat(["the, a, an, that"], target);
                        attackCreature({ socket, user, location, target, activities, setActivities });
                        startDisableInputTimer();
                        // document.getElementById('submit-button').disabled = true;
                        // document.addEventListener("keypress", disableEnterKey);


                    }

                } else if (findIn(input, ["logout", "log out", "log off"])) {
                    /////////////////////
                    //      LOGOUT     //
                    /////////////////////
                    takeTheseOffThat(["logout, log out", "log off"], input);
                    logout({ returnTo: window.location.origin });
                    // socket.emit('logout', location.current.locationName);

                } else if (findIn(input, actionCalls.eat)) {
                    /////////////////////
                    //       EAT       //
                    /////////////////////
                    let eatMessage = takeTheseOffThat(actionCalls.eat, input);
                    eatMessage = takeTheseOffThat(["a", "an", "my", "the"], eatMessage);

                    eatItem(socket, eatMessage, user, location.current.locationName);

                } else {
                    /////////////////////
                    //  UNKNOWN INPUT  //
                    /////////////////////
                    setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `Hmmmm... that didn't quite make sense. Try 'help' for a list of commands!` }]);
                }

            } else if (inConversation) {
                //////////////////////
                // NPC CONVERSATION //
                //////////////////////
                NPCCheck(location.current.NPCs, inConversation.with)
                    .then(({ NPCName, message }) => {
                        socket.emit('to NPC', { user, toNPC: inConversation.with, message: input, route: inConversation.route })
                    })
                    .catch(err => {
                        setConversation(false);
                        console.log(err.message);
                        setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `It looks like ${inConversation.with} has left` }]);
                    })

            } else {
                /////////////////////
                //  UNKNOWN INPUT  //
                /////////////////////
                setChatHistory(prevState => [...prevState, { type: 'displayed-error', text: `Hmmmm... that didn't quite make sense. Try 'help' for a list of commands!` }]);
            }

            setTimeout(() => {
                let anchorDiv = document.getElementById('anchor');
                anchorDiv.scrollIntoView({ behavior: "smooth" });
            }, 250)

            setInput('');

        } catch (e) {
            console.log("ERROR FROM handleMessage(inputPanel.js):");
            console.log(e.message);
            setChatHistory(prevState => [...prevState, { type: "displayed-error", text: "Something went wrong" }]);
            setInput('');
        }
    }


    //display previous commands on key up, key down
    const keyDownResults = (event) => {

        if (event.which === 9 && user.characterName && user.characterName !== 'newUser' && suggestion) {
            event.preventDefault();
            setInput(suggestion);
        } // below only runs if the user has an inputHistory
        else if (inputHistory.length > 0) {
            if (event.which === 38) { // up arrow

                //prevents the inputHistoryIndex getting any lower than zero
                inputHistoryIndex > 0 ? inputHistoryIndex -= 1 : inputHistoryIndex = 0;
                setInput(inputHistory[inputHistoryIndex]);
            } else if (event.which === 40) { // down arrow

                //stop at inputHistory length
                inputHistoryIndex < inputHistory.length ? inputHistoryIndex += 1 : inputHistoryIndex = inputHistory.length;
                //if inputHistoryIndex is less than length, show indexed message, otherwise show ""
                if (inputHistoryIndex < inputHistory.length) {
                    setInput(inputHistory[inputHistoryIndex]);
                } else {
                    setInput('')
                };
            } else if (event.which === 13) { // enter key
                //reset inputHistoryIndex to end
                inputHistoryIndex = inputHistory.length + 1;
            }
        }
    }



    //disable enter key and input button when user needs to just wait a minute
    function disableEnterKey(event) {
        event.preventDefault();
        // console.log(event.key);
        document.getElementById("inputBar").value = "...you are momentarily quite busy";
    }


    //battle
    socket.off('battle').on('battle', ({ attacker, defender, action, damage }) => {
        if (damage) {
            if (user.characterName === attacker) {
                setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You ${action.slice(0, -1)} ${defender} for ${damage} damage!` }]);
                document.removeEventListener("keypress", disableEnterKey);
                setActivities({
                    ...activities,
                    currentlyAttacking: false
                });
            } else if (user.characterName === defender) {
                setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `${attacker} ${action} you for <span className='text-red'>${damage}</span> damage!` }]);
            } else {
                setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `${attacker} ${action} ${defender}!` }]);
            }
        } else {
            if (user.characterName === attacker) {
                setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You try to ${action.slice(0, -1)} ${defender}, but miss.` }]);
                setActivities({
                    ...activities,
                    currentlyAttacking: false
                });
            } else if (user.characterName === defender) {
                setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `${attacker} tries to ${action.slice(0, -1)} you, but misses.` }]);
            } else {
                setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `${attacker} tries to ${action.slice(0, -1)} ${defender}, but misses.` }]);
            }
        }
    });

    //battleVictory
    socket.off('battleVictory').on('battleVictory', ({ victor, defeated }) => {
        if (user.characterName === victor) {
            setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `You have defeated ${defeated}!` }]);
            document.removeEventListener("keypress", disableEnterKey);
            setActivities({
                ...activities,
                currentlyAttacking: false,
                fighting: false
            });
        } else if (user.characterName === defeated) {
            setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `${victor} has defeated you! <span className='text-red'>You have died.</span>` }]);
            setActivities({
                ...activities,
                currentlyAttacking: false,
                fighting: false
            });
            setPlayer({
                ...user,
                isAlive: false
            });
        } else {
            setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: `${victor} has defeated ${defeated}!` }]);
        }
    });


    return (
        <div>
            <BrowserView>
                <div className="input-box">
                    <form
                        onSubmit={handleMessage}
                    >
                        <div id="input-group">
                            <label htmlFor="inputBar" id="hidden-text">User Input Bar: </label>
                            <input
                                value={input}
                                onChange={onInputBarChange}
                                type="text"
                                id="inputBar"
                                className="form-control chat-input" autoFocus="autofocus"
                                autoComplete="off"
                                onKeyDown={keyDownResults}
                            />
                            <input
                                value={suggestion}
                                type="text"
                                id="suggestionBar"
                                className="form-control chat-input"
                                autoComplete="off"
                                readOnly={true}
                            />
                            <span className="input-group-btn">
                                <button type="submit" id="submit-button" className="btn btn-default fa fa-arrow-right"></button>
                            </span>
                        </div>
                    </form>
                </div>
            </BrowserView>
            <MobileView>
                <div className="input-box">
                    <form
                        onSubmit={handleMessage}
                    >
                        <div
                            id="input-group"
                            style={{
                                width: minState === "min" && 100 + "%"
                            }}
                        >
                            <label htmlFor="inputBar" id="hidden-text">User Input Bar: </label>
                            <input
                                onChange={onInputBarChange}
                                type="text"
                                id="inputBar"
                                className="form-control chat-input"
                                onBlur={onBlur}
                                onSelect={onSelect}
                                autoComplete="off"
                                value={input}
                            />
                            <span className="input-group-btn">
                                <button type="submit" id="submit-button" className="btn btn-default fa fa-arrow-right"></button>
                            </span>
                        </div>
                    </form>
                </div>
            </MobileView>
        </div>
    )
}

export default InputPanel;