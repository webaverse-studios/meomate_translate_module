/**
 * The Translate Module
 * Show translated message below original message
 */

const access_token = ''; // https://ai.baidu.com/ai-doc/MT/4kqryjku9

function _handleJokeSkill(keywords) {
    const context = {
        humorApiFunction:'jokes/random',
        humorApiQueryString: `exclude-tags=nsfw,dark,racist,jewish,sexual&include-tags=${keywords.value}`
    }
    window.models_generic.SetCurrentModel('comedian:humorapi')
    window.models_generic.ApplyContextObject(context);
    window.models_generic.CallCurrentModel();
}

async function handleTextSkill(event) {
    debugger
    if (!event.istranslated) {
        let response;
        try {
            response = await fetch(`https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1?access_token=${access_token}`,{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({"q": event.value, "from": "auto", "to": "zh"}),
            })
        } catch(e) {
            console.log(e);
            return;
        }
        const responseText = await response.text();
        const responseObj = JSON.parse(responseText);
        if (responseObj.error_code) {
            console.log(responseObj)
        } else {
            const translatedText = responseObj.result.trans_result[0].dst;
            window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: translatedText, istranslated: true});
        }
    }
    // const responseObj = JSON.parse(response);
    // const name = window.companion.GetCharacterAttribute('name');
    // const joke = JSON.parse(response).joke.replace(/\\/g, '');
    // window.hooks.emit('moemate_core:handle_skill_text', {name: name, value: joke});
}

export function init() {
    window.hooks.on("moemate_core:handle_skill_text", (event) => handleTextSkill(event));
}