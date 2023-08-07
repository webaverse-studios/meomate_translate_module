/**
 * The Translate Module
 * Show translated message below original message
 */

function _handleJokeSkill(keywords) {
    const context = {
        humorApiFunction:'jokes/random',
        humorApiQueryString: `exclude-tags=nsfw,dark,racist,jewish,sexual&include-tags=${keywords.value}`
    }
    window.models_generic.SetCurrentModel('comedian:humorapi')
    window.models_generic.ApplyContextObject(context);
    window.models_generic.CallCurrentModel();
}

function handleTextSkill(event) {
    debugger
    if (!event.istranslated) {
        window.hooks.emit('moemate_core:handle_skill_text', {name: event.name, value: 'translated text: ' + event.value, istranslated: true});
    }
    // const responseObj = JSON.parse(response);
    // const name = window.companion.GetCharacterAttribute('name');
    // const joke = JSON.parse(response).joke.replace(/\\/g, '');
    // window.hooks.emit('moemate_core:handle_skill_text', {name: name, value: joke});
}

export function init() {
    window.hooks.on("moemate_core:handle_skill_text", (event) => handleTextSkill(event));
}