import pluralize from "pluralize";
import doesThisStartWithOneOfThese from "../../../clientUtilities/finders";
const MULTIPLES = ["set", "pair", "box", "bag", "bunch", "square"];



//only pluralize things that don't start with multiples words
function pluralizeAppropriateWords(itemName, itemQuantity) {
  //  console.log(itemName)
  if (doesThisStartWithOneOfThese(itemName, MULTIPLES)) {
    if (itemQuantity > 1) {
      for (const startWord of MULTIPLES) {
        if (startWord.endsWith("ch") || startWord.endsWith("x")) {
          itemName = itemName.replace(startWord, startWord + "es");
        } else {
          itemName = itemName.replace(startWord, startWord + "s");
        }
      }
    }
    return itemName;
  } else {
    return pluralize(itemName, itemQuantity);
  }
}

function showInventory(user, setChatHistory) {
  try {
    let inventoryArray = [];
    const wearingArray = [];
    const userInventory = user.inventory;
    //const wornItems = user.wornItems;

    inventoryArray.push(`\xa0\xa0\xa0\xa0`);
    inventoryArray.push(`You are carrying: `);

    userInventory.forEach(param => {
      inventoryArray.push(`${param.quantity} ${pluralizeAppropriateWords(param.item.itemName, param.quantity)}`);
    })

    if (user.tokens && user.tokens.length > 0) {
      user.tokens.forEach((token) => {
        let { name, quantity } = token;
        if (quantity > 0) inventoryArray.push({
          type: 'displayed-indent sky-blue',
          text: `${quantity} ${pluralizeAppropriateWords(name, quantity)}`
        });
      });
    }

    inventoryArray.push(`\xa0\xa0`);

    inventoryArray = inventoryArray.map(val => typeof val === "object" ? val : { type: 'displayed-indent', text: val })

    if (inventoryArray.length === 0) {
      setChatHistory(prevState => [...prevState, { type: 'displayed-indent', text: `Your inventory is empty!` }]);
    } else {
      setChatHistory(prevState => [...prevState].concat(inventoryArray))
    }

    /*
    WEARABLES
    */

    wearingArray.push(`You are wearing: `);
    for (const bodyLocation in user.wornItems) {
      let slot = bodyLocation.slice(0, -4);
      let wearableItem = user.wornItems[bodyLocation];
      // console.log(bodyLocation, wearableItem);
      if (wearableItem !== null) {
        wearingArray.push(`${wearableItem} on your ${slot}`);
      }
    }
    wearingArray.push(`\xa0\xa0\xa0\xa0`);


    if (wearingArray.length === 2) {
      setChatHistory(prevState => [...prevState, { type: 'displayed-indent', text: `You appear to only be wearing underwear!` }]);
    } else {
      wearingArray.forEach((item) => {
        setChatHistory(prevState => [...prevState, { type: 'displayed-indent', text: `${item}` }]);
      });
    }
  } catch (e) {
    console.log("ERROR FROM inventory:")
    console.log(e.message)
  }

}

export {
  showInventory,
  pluralizeAppropriateWords
}