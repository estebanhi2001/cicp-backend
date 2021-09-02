"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var serviceAccount = require("../tokens/firebasekey.json");
var credentialsGoogle = require("../tokens/googlesdk.json");
var jsonParser = express_1.default.json();
const pouchdb_1 = __importDefault(require("pouchdb"));
pouchdb_1.default.plugin(require('pouchdb-find'));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const axios_cookiejar_support_1 = __importDefault(require("axios-cookiejar-support"));
const tough_cookie_1 = __importDefault(require("tough-cookie"));
const googleapis_1 = require("googleapis");
var cors = require('cors');
function generateToken(n) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var token = '';
    for (var i = 0; i < n; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}
function obtenerIdentidad(token) {
    return __awaiter(this, void 0, void 0, function* () {
        let identidad;
        try {
            identidad = yield admin
                .auth()
                .verifyIdToken(token);
            if (!identidad.permisos)
                identidad.permisos = [];
            if (!identidad.email_verified) {
                throw { error: "Tu correo no está verificado" };
            }
        }
        catch (error) {
            throw { error: "No se pudo verificar la identidad", o: error };
        }
        let usuarioautenticados;
        try {
            usuarioautenticados = (yield usuarios.find({
                selector: {
                    correos: {
                        $elemMatch: identidad.email
                    }
                }
            })).docs;
        }
        catch (error) {
            throw { error: "Ocurrio un error en la búsqueda" };
        }
        if (usuarioautenticados.length == 1) {
            return usuarioautenticados[0];
        }
        else if (usuarioautenticados.length == 0) {
            throw { error: "Usuario no encontrado" };
        }
        else {
            throw { error: "Usuario duplicado, su caso a sido informado automaticamente a soporte técnico" };
        }
    });
}
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: credentialsGoogle,
    scopes: ['https://www.googleapis.com/auth/admin.directory.user'],
});
(0, axios_cookiejar_support_1.default)(axios_1.default);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cicp-olmue.firebaseio.com"
});
const app = (0, express_1.default)();
app.use(cors());
const PORT = 8000;
let usuarios = new pouchdb_1.default("DB/Usuarios");
app.all('/backend', jsonParser, (req, res) => { res.send({ estado: 200 }); });
app.post('/backend/cleanDb', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.token == "oienf3i0f4320FfrEFWerfsc&&%V$") {
        let tokenstemporales = new pouchdb_1.default("DB/TokensTemporales");
        tokenstemporales.find();
    }
    else {
        res.status(400).send("NO ESTAS AUTORIZADO PARA ENTRAR AQUÍ");
    }
}));
app.post('/backend/descargarDBAdmin', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.token || req.body.token != "e3F$%435G$%#45gg$f2345ewfewrew") {
        return res.status(401).send({ error: "Token inválido" });
    }
    let tokenstemporales = new pouchdb_1.default("DB/TokensTemporales");
    let solicitudes = new pouchdb_1.default("DB/Solicitudes");
    res.send({
        usuarios: (yield usuarios.find({
            selector: { _id: { $ne: 'A113' } }
        })).docs,
        tokens: (yield tokenstemporales.find({
            selector: { _id: { $ne: 'A113' } }
        })).docs,
        solicitudes: (yield solicitudes.find({
            selector: { _id: { $ne: 'A113' } }
        })).docs,
    });
}));
app.post('/backend/subirDBAdmin', express_1.default.json({ limit: '20mb' }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.token || req.body.token != "e3F$%435G$%#45gg$f2345ewfewrew") {
        return res.status(401).send({ error: "Token inválido" });
    }
    var response = {};
    if (req.body.usuarios) {
        try {
            yield usuarios.destroy();
            usuarios = new pouchdb_1.default("DB/Usuarios");
            yield usuarios.bulkDocs(req.body.usuarios);
            response.alumnos = yield usuarios.allDocs({ include_docs: true });
        }
        catch (err) {
        }
    }
    if (req.body.tokens) {
        let tokenstemporales = new pouchdb_1.default("DB/TokensTemporales");
        try {
            yield tokenstemporales.destroy();
            tokenstemporales = new pouchdb_1.default("DB/TokensTemporales");
            yield tokenstemporales.bulkDocs(req.body.tokens);
            response.tokens = yield tokenstemporales.allDocs({ include_docs: true });
        }
        catch (err) {
        }
    }
    if (req.body.solicitudes) {
        let solicitudes = new pouchdb_1.default("DB/Solicitudes");
        try {
            yield solicitudes.destroy();
            solicitudes = new pouchdb_1.default("DB/Solicitudes");
            yield solicitudes.bulkDocs(req.body.tokens);
            response.tokens = yield solicitudes.allDocs({ include_docs: true });
        }
        catch (err) {
        }
    }
    res.send(response);
}));
app.post('/backend/yo', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.id_token) {
        res.status(400).send({ error: "Falta el id_token en la solicitud" });
        return;
    }
    try {
        let identidad = yield obtenerIdentidad(req.body.id_token);
        res.send(identidad);
    }
    catch (error) {
        res.status(401).send(error);
    }
}));
app.post('/backend/claves/encontrarrun', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.run) {
        return res.status(400).send({ error: "Falta el R.U.N. en la solicitud" });
    }
    let usuario;
    try {
        usuario = (yield usuarios.get(req.body.run));
    }
    catch (error) {
        return res.send({ tipo: "No Registrado" });
    }
    if (usuario.tipo == "Administrador")
        return res.status(400).send({ error: "No se permite esta acción en el adminstrador de la red" });
    res.send({ tipo: usuario.tipo });
}));
app.post('/backend/claves/obtenercaptcha', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookieJar = new tough_cookie_1.default.CookieJar();
        let result = (yield axios_1.default
            .get('https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml', {
            jar: cookieJar,
            timeout: 1000,
            withCredentials: true,
        })).data;
        var javax = result.substring(result.indexOf("s.ViewState\" id=\"javax.faces.ViewState\" value=\"") + "s.ViewState\" id=\"javax.faces.ViewState\" value=\"".length, result.lastIndexOf("\" autoco"));
        var cookies = cookieJar.getCookiesSync("https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml");
        var SESSIONID = cookies[cookies.findIndex((e) => e.key == "JSESSIONID")].value;
        let img = Buffer.from((yield axios_1.default
            .get(`https://portal.sidiv.registrocivil.cl/usuarios-portal/faces/myFacesExtensionResource/org.apache.myfaces.custom.captcha.CAPTCHARenderer/15923103/;jsessionid=${SESSIONID}}?captchaSessionKeyName=mySessionKeyName`, {
            jar: cookieJar,
            timeout: 2000,
            responseType: 'arraybuffer',
            withCredentials: true,
        })).data, 'binary').toString('base64');
        res.send({
            code: 200,
            respuesta: "",
            javax: javax,
            cookies: Buffer.from(JSON.stringify(cookieJar.toJSON())).toString("base64"),
            captcha: `data:image/jpeg;base64, ${img}`
        });
    }
    catch (error) {
        res.status(500).send({ error: "No se pudo obtener el captcha" });
    }
}));
app.post('/backend/claves/verificaridentidad', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.run)
        return res.status(400).send({ error: "No se encontro run en la solicitud" });
    let identidad;
    try {
        identidad = (yield usuarios.get(req.body.run));
    }
    catch (error) {
        return res.status(404).send({ error: "Error al encontrar autorización" });
    }
    if (identidad.tipo == "Administrador")
        return res.status(400).send({ error: "No se permite esta acción en el adminstrador de la red" });
    let tokenstemporales = new pouchdb_1.default("DB/TokensTemporales");
    let token;
    if (req.body.token) {
        try {
            let tokentemp = yield tokenstemporales.get(req.body.token);
            if (tokentemp.run != req.body.run)
                return res.status(400).send({ error: "El token no coincide con el R.U.N." });
            if (tokentemp.time < Date.now())
                return res.status(400).send({ error: "El token esta expirado" });
            token = {
                _id: tokentemp._id,
                time: tokentemp.time,
                run: req.body.run
            };
        }
        catch (error) {
            return res.status(400).send({ error: "El token no sirve o esta expirado" });
        }
    }
    else {
        if (!req.body.captcha.respuesta)
            return res.status(400).send({ error: "No se encontro captcha en la solicitud" });
        if (!req.body.ndocumento)
            return res.status(400).send({ error: "No se encontro número de documento en la solicitud" });
        if (!req.body.captcha.javax)
            return res.status(400).send({ error: "No se encontro javax en la solicitud" });
        if (!req.body.captcha.cookies)
            return res.status(400).send({ error: "No se encontro cookies en la solicitud" });
        let result = "";
        try {
            const cookieJar = tough_cookie_1.default.CookieJar.fromJSON(JSON.parse(Buffer.from(req.body.captcha.cookies, 'base64').toString("ascii")));
            result = (yield (0, axios_1.default)({
                url: 'https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml',
                jar: cookieJar,
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: `form=form&form:captchaUrl=initial&form:run=${req.body.run}&form:selectDocType=CEDULA&form:docNumber=${req.body.ndocumento}&form:inputCaptcha=${req.body.captcha.respuesta}&form:buttonHidden=&javax.faces.ViewState=${req.body.captcha.javax}`,
                timeout: 4000,
                withCredentials: true,
            })).data;
        }
        catch (error) {
            return res.status(500).send({ error: "No se pudo conectar con el registro civil" });
        }
        if (result.indexOf("Captcha inválido, por favor intente nuevamente") != -1)
            return res.status(403).send({ error: "Captcha inválido por favor intentelo nuevamente, puede ser que deba intentarlo al menos unas 6 veces", codigo: 5000 });
        if (result.indexOf("La información ingresada no corresponde en nuestros registros") != -1)
            return res.status(403).send({ error: "La información ingresada no corresponde en nuestros registros, probablemente ingreso mal el Número de serie o documento", codigo: 5001 });
        if (result.indexOf("No Vigente") != -1)
            return res.status(403).send({ error: "Carnet no vigente", codigo: 5002 });
        if (result.indexOf("Problemas con el servidor.Contacte el administrador.") != -1)
            return res.status(403).send({ error: "Error registro civil, intente de nuevo más tarde", codigo: 5003 });
        if (result.indexOf("class=\"setWidthOfSecondColumn\">Vigente</td>") == -1)
            return res.status(403).send({ error: "Error desconocido", codigo: 5003 });
        token = {
            _id: generateToken(30),
            time: Date.now() + 60 * 60 * 1000,
            run: req.body.run
        };
        try {
            yield tokenstemporales.put(token);
        }
        catch (error) {
            return res.status(500).send({ error: "Error al generar el Token de respuesta" });
        }
    }
    let autorizados = [];
    if (identidad.tipo == "Apoderado") {
        autorizados = (yield usuarios.find({
            selector: {
                _id: { $in: identidad.alumnos }
            }
        })).docs;
    }
    else {
        autorizados = [identidad];
    }
    res.send({
        token: token,
        identidadverificada: identidad,
        autorizados: autorizados
    });
    yield tokenstemporales.close();
}));
app.post('/backend/claves/cambiarclave', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.runusuario)
        return res.status(400).send({ error: "No se encontro el run del usuario en la solicitud" });
    if (!req.body.correousuario)
        return res.status(400).send({ error: "No se encontro el correo en la solicitud" });
    if (!req.body.token)
        return res.status(400).send({ error: "No se encontro el token en la solicitud" });
    if (!req.body.clave)
        return res.status(400).send({ error: "No se encontro la clave en la solicitud" });
    let tokenstemporales = new pouchdb_1.default("DB/TokensTemporales");
    try {
        let token = yield tokenstemporales.get(req.body.token._id);
        if (token.run != req.body.token.run)
            return res.status(400).send({ error: "El token no coincide con el R.U.N." });
        if (token.time < Date.now())
            return res.status(400).send({ error: "El token esta expirado", code: 6000 });
        token.time = Date.now() + 20 * 60 * 1000;
        yield tokenstemporales.put(token);
    }
    catch (error) {
        return res.status(400).send({ error: "El token no sirve o esta expirado" });
    }
    yield tokenstemporales.close();
    let autorizado = false;
    try {
        let identidadusuario = yield usuarios.get(req.body.token.run);
        if (identidadusuario._id == req.body.runusuario) {
            if (identidadusuario.correos.includes(req.body.correousuario)) {
                autorizado = true;
            }
        }
        else {
            if (identidadusuario.alumnos && identidadusuario.alumnos.includes(req.body.runusuario)) {
                let alumno = yield usuarios.get(req.body.runusuario);
                if (alumno.correos.includes(req.body.correousuario)) {
                    autorizado = true;
                }
            }
        }
    }
    catch (error) {
        return res.status(400).send({ error: "No se pudo autorizar su solicitud" });
    }
    const service = googleapis_1.google.admin({ version: 'directory_v1', auth: auth });
    try {
        yield service.users.update({ userKey: req.body.correousuario, requestBody: { password: req.body.clave } });
        res.send({ code: 200 });
    }
    catch (error) {
        if (error && error.code == 403)
            return res.send({ error: "La página web no se encuentra autorizada para cambiar está clave, por favor contacta con soporte" });
        res.send({ error: "La página no pudo cambiar la clave, intenta nuevamente o cumunicate con soporte" });
    }
}));
app.post('/backend/solicitarcuentas/solicitudeshechaspormi', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.id_token)
        return res.status(400).send({ error: "No se encontro el id_token en la solicitud" });
    let identidad;
    try {
        identidad = yield obtenerIdentidad(req.body.id_token);
    }
    catch (error) {
        return res.status(401).send(error);
    }
    let solicitudesdb = new pouchdb_1.default("DB/Solicitudes");
    try {
        return res.send({
            solicitudes: (yield solicitudesdb.find({
                selector: {
                    solicitante: identidad._id
                }
            })).docs
        });
    }
    catch (error) {
        return res.status(500).send({ error: "Hay un error en el servidor", catch: error, identidad: identidad });
    }
}));
app.post('/backend/solicitarcuentas/enviarsolicitud', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.id_token)
        return res.status(400).send({ error: "No se encontro el id_token en la solicitud" });
    if (!req.body.solicitudes)
        return res.status(400).send({ error: "No se encontro las solicitudes en la solicitud" });
    let identidad;
    try {
        identidad = yield obtenerIdentidad(req.body.id_token);
    }
    catch (error) {
        return res.status(401).send(error);
    }
    let respuesta = [];
    req.body.solicitudes.forEach((raw) => {
        let b = {};
        if (raw.run && typeof raw.run == "string")
            b.run = raw.run;
        else
            return;
        if (raw.nombre && typeof raw.nombre == "string")
            b.nombre = raw.nombre;
        else
            return;
        if (raw.apellido && typeof raw.apellido == "string")
            b.apellido = raw.apellido;
        else
            return;
        if (raw.curso && typeof raw.curso == "string")
            b.curso = raw.curso;
        if (raw.tipo && typeof raw.tipo == "string")
            b.tipo = raw.tipo;
        else
            return;
        if (raw.letra && typeof raw.letra == "string")
            b.letra = raw.letra;
        if (raw.modalidad && typeof raw.modalidad == "string")
            b.modalidad = raw.modalidad;
        if (raw.tipo == "Alumno" && raw.apoderados && Array.isArray(raw.apoderados) && (raw.apoderados = raw.apoderados.filter((e) => typeof e == "string")).length > 0)
            b.apoderados = raw.apoderados;
        if (raw._id && typeof raw._id == "string" && raw._rev && typeof raw._rev == "string") {
            b._id = raw._id;
            b._rev = raw._rev;
        }
        if (raw._deleted && typeof raw._deleted == "boolean" && b._id && b._rev) {
            b._deleted = raw._deleted;
        }
        if (typeof raw.estado == "number") {
            if (raw.estado == 0)
                b.estado = 1;
            else
                b.estado = raw.estado;
        }
        else
            return;
        if (Object.entries(b).length != 0) {
            if (!b.solicitante) {
                b.solicitante = identidad._id;
                b.infosolicitante = identidad;
            }
            respuesta.push(b);
        }
    });
    let solicitudesdb = new pouchdb_1.default("DB/Solicitudes");
    try {
        yield solicitudesdb.bulkDocs(respuesta);
    }
    catch (error) {
    }
    try {
        return res.send({
            solicitudes: (yield solicitudesdb.find({
                selector: {
                    solicitante: identidad._id
                }
            })).docs
        });
    }
    catch (error) {
        return res.status(500).send({ error: "Hay un error en el servidor", catch: error, identidad: identidad });
    }
}));
app.get('/cache', jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Hola");
}));
app.listen(PORT, () => {
    // console.log(`Servidor iniciado en ${new Date()}`);
});