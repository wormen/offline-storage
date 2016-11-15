/**
 Copyright © Oleg Bogdanov
 Developer: Oleg Bogdanov
 Contacts: olegbogdanov86@gmail.com
 ------------------------------------------
 */

"use strict";

const LZString = require('../vendor/lz-string.min');

let storeName = 'email_sender';

class Store{
    constructor(){
        this.instance = null;
        this.prefix = `_mst__`;
        this.signPack = `.packz`;

        this.StoreName = storeName;
        this.size = 5e+8; // 500mb

        this.isCompress = true;

        this.Init();
    }

    _isJson(str){
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    _encode(value){
        return JSON.stringify(value);
    }

    _decode(val){
        try{
            if(this._isJson(val))
                return JSON.parse(val);
            else
                return val;
        }catch(e){
            return null;
        }
    }

    _compress(str){
        str = JSON.stringify(str);
        return LZString.compress(str);
    }

    _unpack(str, isCompress){
        if(String(str).includes(this.signPack))
            str = String(str).replace(this.signPack, ``);


        if(isCompress){
            str = LZString.decompress(str);

            if(this._isJson(str)) str = JSON.parse(str);

            return str;
        }else
            return str;
    }

    _convert(val, isPack = false){

        if(this.isCompress){
            if(isPack)
                return this._compress(val)+this.signPack;

            return this._unpack(val, true);
        }

        return val;
    }

    Init(instanceName = ''){
        var localforage = require('../vendor/localforage.min.js');//require('localforage/dist/localforage.min.js');

        localforage.config({
            name: this.StoreName, // название базы
            size: this.size // максимальный размер базы
        });

        // доступные драйвера для подключения к хранилищам
        let drivers = [
            localforage.INDEXEDDB,
            localforage.WEBSQL,
            localforage.LOCALSTORAGE
        ];

        localforage.setDriver(drivers);

        localforage.createInstance({
            name: (instanceName ? instanceName : this.StoreName)
        });

        this.instance = localforage;
    }

    Get(key, callback){
        let self = this;

        if(callback)
            this.instance.getItem(this.prefix + key, (e,v)=>{
                v = self._convert(v);
                callback(e,v);
            });
        else
            return this.instance.getItem(this.prefix + key)
                .then(value => { return self._convert(value); })
                .catch(err => { console.error(err); });

    }

    Set(key, value, callback){
        value = this._convert(value, true);

        if(callback)
            this.instance.setItem(this.prefix + key, value, callback);
        else
            return this.instance.setItem(this.prefix + key, value);
    }

    Remove(key, callback){
        if(callback)
            this.instance.removeItem(this.prefix + key, callback);
        else
            return this.instance.removeItem(this.prefix + key);
    }

    Clear(callback){
        if(callback)
            this.instance.clear(callback);
        else
            return this.instance.clear();
    }

    Length(callback){
        if(callback)
            this.instance.length(callback);
        else
            return this.instance.length();
    }

    Key(keyIndex, callback){
        if(callback)
            this.instance.key(keyIndex, callback);
        else
            return this.instance.key(keyIndex);
    }

    Keys(callback){
        if(callback)
            this.instance.keys(callback);
        else
            return this.instance.keys();
    }
}

module.exports = new Store;