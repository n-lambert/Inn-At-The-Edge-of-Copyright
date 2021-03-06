import { pluralizeAppropriateWords } from "./inventory";




function lookAbout(location, setChatHistory, day) {
    // console.log("INSIDE LOOK:");
    // console.log(location);
    try {
        // console.log(location);
        const lookArray = [];
        const inventoryArray = [];
        const availableNPCs = [];
        const fightables = location.current.fightables.filter(en => en.isAlive);

        location.current.inventory.forEach(param => {
            if (param.quantity > 0) {
                inventoryArray.push(`${param.quantity} ${pluralizeAppropriateWords(param.item.itemName, param.quantity)}`);
            }
        })

        location.current.NPCs.forEach(npc => {
            availableNPCs.push(`${npc.primaryName}`)
        })

        const exitDescriptors = [];

        for (const exitPath in location.current.exits) {
            !location.current.exits[exitPath].hidden && exitDescriptors.push(`${exitPath}`);
        }

        lookArray.push(day ? `${location.current.dayDescription}` : `${location.current.nightDescription}`);

        setChatHistory(prevState => [...prevState, { type: 'displayed-stat', text: 'You look around:' }]);


        setChatHistory(prevState => [...prevState, { type: 'displayed-indent displayed-intro', text: `${lookArray}` }]);
        if (availableNPCs.length > 0) {
            setChatHistory(prevState => [...prevState, { type: 'displayed-indent', text: `You may want to speak to ${availableNPCs}.` }]);
        }

        if (fightables) {
            // console.log(fightables);
            if (fightables.length > 0) {
                setChatHistory(prevState => [...prevState, {
                    type: 'displayed-stat', text: `You see some creatures prowling around this area: <span className='text-warning'>${fightables.map(en => {
                        return en.name;
                    }).join(", ")}</span>.`
                }]);

            }
        }

        setChatHistory(prevState => [...prevState, { type: 'displayed-indent displayed-intro font-italic', text: `Exits: ${exitDescriptors.join(", ")}.` }]);

        if (inventoryArray.length > 0) {
            setChatHistory(prevState => [...prevState, { type: 'displayed-indent displayed-intro font-italic', text: `In the room someone has left: ${inventoryArray.join(", ")}.` }]);
        }

    } catch (e) {
        console.log("ERROR FROM lookAbout:");
        console.log(e.message);
    }

}



export {
    lookAbout
}