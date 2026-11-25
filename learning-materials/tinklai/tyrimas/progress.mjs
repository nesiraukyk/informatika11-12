import {restoreProgress} from './restore.mjs';
export const STORAGE_KEY='ngg.network.inquiry.v1';
export function emptyProgress(){return {version:1,current:'lan-print',records:{}}}
export function loadProgress(storage){try{const raw=storage.getItem(STORAGE_KEY);if(!raw)return {data:emptyProgress(),persistent:true};if(raw.length>2000000)throw Error();const data=JSON.parse(raw);if(data.version!==1||!data.records||typeof data.records!=='object'||Array.isArray(data.records))throw Error();return {data:restoreProgress(data),persistent:true}}catch{return {data:emptyProgress(),persistent:false}}}
export function saveProgress(storage,data){try{storage.setItem(STORAGE_KEY,JSON.stringify(data));return true}catch{return false}}
export function clearProgress(storage){try{storage.removeItem(STORAGE_KEY);return true}catch{return false}}
export function recordExperiment(record,observation){record.observations??=[];record.observations.push({...observation,time:new Date().toISOString()});record.observations=record.observations.slice(-40)}
export function newRecord(network){return {stage:0,network,hypothesis:'',prediction:'',conclusion:'',observations:[],answers:{},self:{},hints:0,attempt:0}}
