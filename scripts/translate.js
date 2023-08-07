/**
 * The Translate Module
 * Show translated message below original message
 */

const access_token = ''; // https://ai.baidu.com/ai-doc/MT/4kqryjku9

async function translateText(text) {
    let response;
    try {
        response = await fetch(`https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1?access_token=${access_token}`,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({"q": text, "from": "auto", "to": "zh"}),
        })
    } catch(e) {
        console.log(e);
        return false;
    }
    const responseText = await response.text();
    const responseObj = JSON.parse(responseText);
    if (responseObj.error_code) {
        console.log(responseObj)
        return false;
    } else {
        const translatedText = responseObj.result.trans_result[0].dst;
        return translatedText;
    }
}

async function handleTextSkill(event) {
    let emote = /\*.*\*/.exec(event.value);
    if (emote) return;

    await window.companion.WaitForTurn(async () => {
        const translatedText = await translateText(event.value);
        // await new Promise(resolve => setTimeout(resolve, 3000)); // for testing message order
        if (translatedText) window.companion.SendMessage({type: "TEXT", user: event.name, value: translatedText});
    });
}

export function init() {
    window.hooks.on("moemate_core:handle_skill_text", (event) => handleTextSkill(event));
}