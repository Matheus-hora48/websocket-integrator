import axios from 'axios';
import { changeTime } from './utils';

require('dotenv').config()

const API_URL = process.env.API_URL;

class SyncPros {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      const selectSrc = await this.getProsSrc();
      const selectDest = await this.getProsDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codparc == itemUm.codparc &&
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

      console.log("Iniciando o sync dos prospects");

      if (listInsert.length > 0) {
        await this.insertPros(listInsert);
      }

      if (listUpdate.length > 0) {
        await this.updatePros(listUpdate, selectDest);
      }

      console.log("Sincronização dos prospects finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  async getProsDest() {
    const response = await axios.get(`${API_URL}/prospects/select`);
    return response.data;
  }

  async getProsSrc() {
    const response = await axios.get('url_api_bussines');
    return response.data;
  }

  async insertPros(listInsert) {
    for (const row of listInsert) {
      const dataInsert = {
        cadparc: row.cadparc,
        coddomi: row.coddomi,
        id_fili: row.id_fili,
        nomparc: row.nomparc,
        sobparc: row.sobparc,
        cgcende: row.cgcende,
        fonende: row.fonende,
        codparc: row.codparc,
        codcida: row.codcida,
        usuparc: row.usuparc,
        is_leds: row.is_leds,
        is_parc: row.is_parc,
        updated_at: row.updated_at,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${API_URL}/prospects/enviar`,
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

  async updatePros(listUpdate, selectDest) {
    for (const row of listUpdate) {
      const itemAchado = selectDest.find(
        (itemDois) =>
          itemDois.codparc == row.codparc && itemDois.id_fili == row.id_fili
      );

      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${API_URL}/prospects/${itemAchado?.id}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          cadparc: row.cadparc,
          coddomi: row.coddomi,
          id_fili: row.id_fili,
          nomparc: row.nomparc,
          sobparc: row.sobparc,
          cgcende: row.cgcende,
          fonende: row.fonende,
          codparc: row.codparc,
          codcida: row.codcida,
          usuparc: row.usuparc,
          is_leds: row.is_leds,
          is_parc: row.is_parc,
          updated_at: row.updated_at,
        },
      };

      try {
        await axios(config);
        console.log(`Registro atualizado com sucesso: ${row.codparc}`);
      } catch (e) {
        console.error(`Erro ao atualizar registro: ${row.codparc}`);
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }
}

export default new SyncPros();