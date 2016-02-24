'use strict';

function detailService() {

    this.setCurrentParent = function setCurrentParent(parentId) {
        this.curentParrent = parentId;
    };

    this.getCurrentParent = function getCurrentParent() {
        if (!this.curentParrent) {
            this.curentParrent = null;
        }
        return this.curentParrent;
    };

    this.getStepNumberInParent = function getStepNumberInParent(childId, parent) {
        if (!parent.properties.children) {
            return false;
        }
        for (var i = 0; i < parent.properties.children.length; i++) {
            var child = parent.properties.children[i];
            if (child === childId) {
                return i+1;
            }
        }

        return false;
    };

    this.hasInfos = function hasInfos (obj) {
    // Retrn true if object contains at least one element of arguments
        var infos = 0;
        for (var i = 0; i < arguments.length; i++) {
            if (obj[arguments[i]] !== undefined && obj[arguments[i]] !== '') {
                infos++;
            }
        }
        return infos > 0;
    };

}

module.exports = {
    detailService: detailService
};
