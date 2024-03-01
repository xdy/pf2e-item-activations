import { ITEM_LIST } from "./item-list.js";

export const marker = '[X]';

export function activateAction(action) {
    action.name = marker.concat(' ', action.name)
    return action;
}

export function deactivateAction(action) {
    action.name = action.name.replaceAll(marker, '').trim();
    return action;
}

/**
 * Turns on or Off activations for a particular item
 * @param {*} item 
 * @param {'On' | 'Off' | 'None'} changeType 
 */
 export async function turnOnOffActivation(item, changeType) {
    const actor = item.actor;
    const slug = item.system.slug;
    const actionSlugs = ITEM_LIST[slug].slugs;
    if (actionSlugs.length === 0) return;
    const actions = [];
    const missingActions = [];
    for (const itemSlug of actionSlugs) {
        const action = actor.items.find(it => it.system.slug === itemSlug);
        if (action) {
            actions.push(action);
        } else {
            missingActions.push(itemSlug)
        }
    }
    const nameIds = actions.map(action => ({
        _id: action.id,
        name: activateAction(action).name
    }))
    if (changeType === 'On') {
        if (missingActions.length > 0) {
            const activations = [];
            for (const actionSlug of missingActions) {
                let idx = ITEM_LIST[slug].slugs.indexOf(actionSlug);
                let action = await fromUuid(ITEM_LIST[slug].actions[idx]);
                action = action.toObject()
                action = augmentAction(action, item)
                activations.push(action)
            }
            actor.createEmbeddedDocuments("Item", activations);
        }
        actor.updateEmbeddedDocuments("Item", nameIds);
    } else if (changeType === 'Off') {
        actor.updateEmbeddedDocuments("Item", nameIds.map(action => ({
            _id: action._id,
            name: deactivateAction(action).name
        })));
    }
}