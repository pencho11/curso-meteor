import Vue from 'vue';

function commentNode(el, vnode) {
    const comment = document.createComment(' ');

    Object.defineProperty(comment, 'setAttribute', {
        value: () => undefined
    })

    vnode.text = ' ';
    vnode.elm = comment;
    vnode.iscomment = true;
    vnode.context = undefined;
    vnode.tag = undefined;
    vnode.data.directives = undefined;

    if (vnode.componentInstance) {
        vnode.componentInstance.$el = comment;
    }

    if (el.parentNode) {
        el.parentNode.replaceChild(comment, el);
    }
}

Vue.directive('can', function (el, binding, vnode) {
    const behaviour = binding.modifiers.disable ? 'disable' : 'hide';
    const ok = Roles.userIsInRole(Meteor.userId(), `${binding.value}-${binding.arg}`, Meteor.user().profile.profile);
    if (!ok) {
        if (behaviour === 'hide') {
            commentNode(el, vnode);
        } else if (behaviour === 'disable') {
            el.disabled = true;
        }
    }
})