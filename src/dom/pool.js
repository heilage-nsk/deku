export default class Pool {
    constructor() {
        this.storage = {};
    }

    store(el) {
        let tagName = el.tagName.toLowerCase();
        if (!this.storage[tagName]) {
            this.storage[tagName] = [];
        }

        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }

        if (el.childNodes.length > 0) {
            console.error(`Node pool warning: Storing <${tagName}> with ${el.childNodes.length} children. 
                          This shouldn't happen: do not store nodes with children!`);
            for (let i=el.childNodes.length; i--; ) {
                this.store(el.childNodes[i]);
            }
        }

        this.storage[tagName].push(el);
    }

    get(tagName) {
        return this._get(tagName);
    }

    getNS(tagName, namespace) {
        return this._get(tagName, 'namespace', namespace);
    }

    getSvg(tagName) {
        return this._get(tagName, 'svg');
    }

    preallocate(tagName, size) {
        return this._preallocate(tagName, size);
    }

    preallocateNS(tagName, size, namespace) {
        return this._preallocate(tagName, size, 'namespace', namespace);
    }

    preallocateSvg(tagName, size) {
        return this._preallocate(tagName, 'svg');
    }

    _get(tagName, type = null, namespace = null) {
        tagName = tagName.toLowerCase();
        if (this.storage[tagName] && this.storage[tagName].length > 0) {
            return this.storage[tagName].pop();
        }
        return this._create(tagName, type, namespace);
    }

    _create(tagName, type = null, namespace = null) {
        tagName = tagName.toLowerCase()
        switch (type) {
            case 'svg':
                return document.createElementNS('http://www.w3.org/2000/svg', tagName);
            case 'namespace':
                if (!namespace) {
                    throw new TypeError('getNS: namespace required');
                }
                return document.createElementNS(namespace, tagName);
        }
        return document.createElement(tagName);

    }

    _preallocate(tagName, size, type = null, namespace = null) {
        tagName = tagName.toLowerCase()
        if (this.storage[tagName] && this.storage[tagName].length >= size) {
            return;
        }

        if (!this.storage[tagName]) {
            this.storage[tagName] = [];
        }

        var difference = size - this.storage[tagName].length;
        for (var poolAllocIter = 0; poolAllocIter < difference; poolAllocIter++) {
            this.store(this._create(tagName, type, namespace), false);
        }
    }

    // for tests only
    _getStorageSizeFor(tagName) {
        return (this.storage[tagName] || []).length;
    }
}

