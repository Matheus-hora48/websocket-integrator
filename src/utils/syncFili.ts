import axios from 'axios';
import { removeDuplicates, changeTime } from './utils';

require('dotenv').config()

const API_URL = process.env.API_URL;

class SyncFili {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      const selectSrc = await this.getFiliSrc();
      const selectDest = await this.getFiliDest();

      for (const itemSrc of selectSrc) {
        if (selectDest.length === 0) {
          listInsert.push(itemSrc);
        } else {
          const itemDest = selectDest.find(
            (itemDois) =>
              itemDois.coddomi === itemSrc.coddomi &&
              itemDois.id_fili === itemSrc.id_fili
          );

          if (!itemDest) {
            listInsert.push(itemSrc);
          } else if (
            changeTime(itemSrc.updated_at) !==
            changeTime(itemDest.updated_at)
          ) {
            listUpdate.push(itemSrc);
          }
        }
      }

      console.log("Iniciando o sync das filiais");

      if (listInsert.length > 0) {
        await this.insertFili(listInsert);
      }

      if (listUpdate.length > 0) {
        await this.updateFili(listUpdate, selectDest);
      }

      console.log("Sincronização das filiais finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  async getFiliDest() {
    const response = await axios.get(`${API_URL}/filiais/select`);
    return response.data;
  }

  async getFiliSrc() {
    const response = await axios.get('url_api_bussines');
    return response.data;
  }

  async insertFili(listInsert) {
    for (const row of removeDuplicates(listInsert)) {
      const dataInsert = {
        coddomi: row.coddomi,
        cnpfili: row.cnpfili,
        id_fili: row.id_fili,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${API_URL}/filiais/enviar`,
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

  async updateFili(listUpdate, selectDest) {
    for (const row of removeDuplicates(listUpdate)) {
      const itemFound = selectDest.find(
        (itemDois) =>
          itemDois.coddomi === row.coddomi && itemDois.id_fili === row.id_fili
      );

      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${API_URL}/filiais/${itemFound?.id}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          coddomi: row.coddomi,
          cnpfili: row.cnpfili,
          id_fili: row.id_fili,
        },
      };

      try {
        await axios(config);
        console.log(`Registro atualizado com sucesso: ${row.coddomi}`);
      } catch (e) {
        console.error(`Erro ao atualizar registro: ${row.coddomi}`);
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }
}

export default new SyncFili();