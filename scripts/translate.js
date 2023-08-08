/**
 * The Translate Module
 * Show translated message below original message
 */

const access_token = ''; // https://ai.baidu.com/ai-doc/MT/4kqryjku9

async function translateText(text) {
    const context = {
        access_token,
        payload: JSON.stringify({"q": text, "from": "auto", "to": "zh"}),
    }
    const model = window.models.CreateModel('translate:translateapi')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    const translatedText = response.result.trans_result[0].dst;
    window.models.DestroyModel(model);
    return translatedText;
}

async function speakText(text) {
    const context = {
        access_token,
        text,
        hightQuality: false,
        // hightQuality: false: QPS 10, and I have totally 50000 calls.
        // hightQuality: true:  QPS 2,  and I have totally 2000  calls only, maybe fail when you trying, and please use sparingly🙏.
    }
    const model = window.models.CreateModel('translate:voiceapi')
    window.models.ApplyContextObject(model, context);
    const stream_uuid = await window.models.CallModel(model, undefined, {stream: true, abortable: true, timeout: 20000});
    await window.companion.SendVoiceStream(stream_uuid);
    window.models.DestroyModel(model);
}

async function handleTextSkill(event) {
    let emote = /\*.*\*/.exec(event.value);
    if (emote) return;

    await window.companion.WaitForTurn(async () => {
        // await new Promise(resolve => setTimeout(resolve, 3000)); // for testing message order
        const translatedText = await translateText(event.value);
        const name = window.companion.GetCharacterAttribute('name');
        if (translatedText) {
            window.companion.SendMessage({type: "TEXT", user: name, value: translatedText});
            await speakText(translatedText);
        }
    });
}

// async function _handleApiResponse(response) {
//     const translatedText = response.response.result.trans_result[0].dst;
//     const name = window.companion.GetCharacterAttribute('name');
//     if (translatedText) window.companion.SendMessage({type: "TEXT", user: name, value: translatedText});
// }

export function init() {
    window.hooks.on("moemate_core:handle_skill_text", (event) => handleTextSkill(event));
    // window.hooks.on('models:response:translate:translateapi', _handleApiResponse);
}