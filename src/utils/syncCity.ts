import axios from 'axios';
import { removeDuplicates, changeTime } from './utils';

require('dotenv').config()

const API_URL = process.env.API_URL;

class SyncCity {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      const selectSrc = await this.getCitSrc();
      const selectDest = await this.getCitDest();

      for (const itemSrc of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemSrc);
        } else {
          const itemDest = selectDest.find(
            (itemDois) =>
              itemDois.codmuni == itemSrc.codmuni &&
              itemDois.id_fili == itemSrc.id_fili,
          );

          if (!itemDest) {
            listInsert.push(itemSrc);
          } else if (
            changeTime(itemSrc.updated_at) !=
            changeTime(itemDest.updated_at)
          ) {
            listUpdate.push(itemSrc);
          }
        }
      }

      console.log('Iniciando o sync das cidades');

      if (listInsert.length > 0) {
        await this.insertCities(listInsert);
      }

      if (listUpdate.length > 0) {
        await this.updateCities(listUpdate, selectDest);
      }

      console.log('Sincronização das cidades finalizada');
    } catch (err) {
      console.error(err);
    }
  }

  async getCitDest() {
    const response = await axios.get(`${API_URL}/cidades/select`);
    return response.data;
  }

  async getCitSrc() {
    const response = await axios.get('url_api_bussines');
    return response.data;
  }

  async insertCities(listInsert) {
    for (const row of removeDuplicates(listInsert)) {
      const dataInsert = {
        codmuni: row.codmuni,
        uf_muni: row.uf_muni,
        nommuni: row.nommuni,
        id_fili: row.id_fili,
        updated_at: row.updated_at,
      };

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${API_URL}/enviar`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: dataInsert,
      };

      try {
        await axios(config);
      } catch (e) {
        console.error(
          `Erro ao inserir registro: ${JSON.stringify(dataInsert)}`,
        );
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }

  async updateCities(listUpdate, selectDest) {
    for (const row of removeDuplicates(listUpdate)) {
      const itemFound = selectDest.find(
        (itemDois) =>
          itemDois.codmuni == row.codmuni && itemDois.id_fili == row.id_fili,
      );

      const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${API_URL}/${itemFound?.id}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          codmuni: row.codmuni,
          uf_muni: row.uf_muni,
          nommuni: row.nommuni,
          id_fili: row.id_fili,
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

export default new SyncCity();
