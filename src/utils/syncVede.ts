import axios from 'axios';
import { changeTime } from './utils';

require('dotenv').config()

const API_URL = process.env.API_URL;

class SyncVede {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      const selectSrc = await this.getVendedorSrc();
      const selectDest = await this.getVendedorDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codusua == itemUm.codusua &&
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

      console.log("Iniciando o sync dos vendedores");

      if (listInsert.length > 0) {
        await this.insertVendedor(listInsert);
      }

      if (listUpdate.length > 0) {
        await this.updateVendedor(listUpdate, selectDest);
      }

      console.log("Sincronização dos vendedores finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  async getVendedorDest() {
    const response = await axios.get(`${API_URL}/vendedores/select`);
    return response.data;
  }

  async getVendedorSrc() {
    const response = await axios.get('url_api_vendedor');
    return response.data;
  }

  async insertVendedor(listInsert) {
    for (const row of listInsert) {
      const dataInsert = {
        codusua: row.codusua,
        id_fili: row.id_fili,
        logusua: row.logusua,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${API_URL}/vendedores/enviar`,
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

  async updateVendedor(listUpdate, selectDest) {
    for (const row of listUpdate) {
      const itemAchado = selectDest.find(
        (itemDois) =>
          itemDois.codusua == row.codusua && itemDois.id_fili == row.id_fili
      );

      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${API_URL}/vendedores/${itemAchado?.id}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          codusua: row.codusua,
          id_fili: row.id_fili,
          logusua: row.logusua,
        },
      };

      try {
        await axios(config);
        console.log(`Registro atualizado com sucesso: ${row.codusua}`);
      } catch (e) {
        console.error(`Erro ao atualizar registro: ${row.codusua}`);
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }
}

export default new SyncVede();
