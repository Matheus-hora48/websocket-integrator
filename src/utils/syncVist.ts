import axios from 'axios';
import { changeTime } from './utils';

require('dotenv').config()

const API_URL = process.env.API_URL;

class SyncVist {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      const selectSrc = await this.getVisitasSrc();
      const selectDest = await this.getVisitasDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codvist == itemUm.codvist &&
              itemDois.id_fili == itemUm.id_fili
          );

          if (!itemAchado) {
            listInsert.push(itemUm);
          } else if (
            changeTime(itemUm.updated_at) !=
            changeTime(itemAchado.updated_at)
          ) {
            listUpdate.push(itemUm);
          }
        }
      }

      console.log("Iniciando o sync das visitas");

      if (listInsert.length > 0) {
        await this.insertVisita(listInsert);
      }

      if (listUpdate.length > 0) {
        await this.updateVisita(listUpdate, selectDest);
      }

      console.log("Sincronização das visitas finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  async getVisitasDest() {
    const response = await axios.get(`${API_URL}/visitas/select`);
    return response.data;
  }

  async getVisitasSrc() {
    const response = await axios.get('url_api_visitas');
    return response.data;
  }

  async insertVisita(listInsert) {
    for (const row of listInsert) {
      const dataInsert = {
        codvist: row.codvist,
        id_fili: row.id_fili,
        datvist: row.datvist,
        empvist: row.empvist,
        resvist: row.resvist,
        docvist: row.docvist,
        fonvist: row.fonvist,
        locvist: row.locvist,
        usuvist: row.usuvist,
        dtrvist: row.dtrvist,
        is_leds: row.is_leds,
        dthleds: row.dthleds,
        obsleds: row.obsleds,
        usuleds: row.usuleds,
        is_parc: row.is_parc,
        dthparc: row.dthparc,
        obsparc: row.obsparc,
        usuparc: row.usuparc,
        codcida: row.codcida,
        updated_at: row.updated_at,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${API_URL}/visitas/enviar`,
        headers: {
          "Content-Type": "application/json",
        },
        data: dataInsert,
      };

      try {
        await axios(config);
      } catch (e) {
        console.error(
          `Erro ao inserir registro: ${JSON.stringify(dataInsert)}`
        );
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }

  async updateVisita(listUpdate, selectDest) {
    for (const row of listUpdate) {
      const itemAchado = selectDest.find(
        (itemDois) =>
          itemDois.codvist == row.codvist && itemDois.id_fili == row.id_fili
      );

      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${API_URL}/visitas/${itemAchado?.id}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          codvist: row.codvist,
          id_fili: row.id_fili,
          datvist: row.datvist,
          empvist: row.empvist,
          resvist: row.resvist,
          docvist: row.docvist,
          fonvist: row.fonvist,
          locvist: row.locvist,
          usuvist: row.usuvist,
          dtrvist: row.dtrvist,
          is_leds: row.is_leds,
          dthleds: row.dthleds,
          obsleds: row.obsleds,
          usuleds: row.usuleds,
          is_parc: row.is_parc,
          dthparc: row.dthparc,
          obsparc: row.obsparc,
          usuparc: row.usuparc,
          codcida: row.codcida,
          updated_at: row.updated_at,
        },
      };

      try {
        await axios(config);
        console.log(`Registro atualizado com sucesso: ${row.codvist}`);
      } catch (e) {
        console.error(`Erro ao atualizar registro: ${row.codvist}`);
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }
}

export default new SyncVist();
