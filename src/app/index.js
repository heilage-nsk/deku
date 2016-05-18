import * as dom from '../dom'
import {diffNode} from '../diff'
import empty from '@f/empty-element'
import noop from '@f/noop'
import {str as adler32} from 'adler-32'

/**
 * Create a DOM renderer using a container element. Everything will be rendered
 * inside of that container. Returns a function that accepts new state that can
 * replace what is currently rendered.
 */

export function createApp (container, handler = noop, options = {}) {
  let oldVnode = null
  let node = null
  let rootId = options.id || '0'
  let dispatch = effect => effect && handler(effect)

  let update = (newVnode, context) => {
    let changes = diffNode(oldVnode, newVnode, rootId)
    node = changes.reduce(dom.updateElement(dispatch, context), node)
    oldVnode = newVnode
    return node
  }

  let create = (vnode, context) => {
    if (container){
      if(container.childNodes.length === 0){
        node = dom.createElement(vnode, rootId, dispatch, context)
        container.appendChild(node)
      }else{
        let {DOMnode, attachEvents} = dom.createElementThenEvents(vnode, rootId, dispatch, context)
        let isRenderedCorrectly = true

/*
 * TODO: пропатчить либу, чтобы были минимально возможные изменения при восстановлении из html.
 *
 * Сейчас при несовпадении html (даже если несовпадение _только_ в дочерних нодах) - ререндерится вообще ВСЁ. Это не то, что нам бы хотелось.
 * Идеи:
 * - Создать из текущего html дерево native-vnode и сравнить диффом со сгенерированным из клиентских компонентов.
 *   После чего просто пройтись диффом! Кажется, тут могут всплыть подводные камеи: как понять, куда монтируется компонентная нода?
 * - При создании каждой компонентной ноды проверять наличие аналогичной в дереве и применять дифф.
 *   Разобраться, как создаются нативные ноды из компонентных!
 */

    //    if(container.attributes.checksum){
    //      isRenderedCorrectly = container.attributes.checksum ===  adler32(DOMnode.outerHTML)
    //    }else if(container.attributes.autoFix){
          isRenderedCorrectly = container.innerHTML ===  DOMnode.outerHTML
          console.log(container.innerHTML, DOMnode.outerHTML);
    //    }

        node = DOMnode
        if(isRenderedCorrectly){
          attachEvents(container.firstChild)
        }else{
          container.innerHTML = ''
          container.appendChild(node)
        }
      }
    }else{
      node = dom.createElement(vnode, rootId, dispatch, context)
    }
    oldVnode = vnode
    return node
  }

  return (vnode, context = {}) => {
    return node !== null
      ? update(vnode, context)
      : create(vnode, context)
  }
}
