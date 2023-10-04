import axios from 'axios';
import { changeTime } from './utils';

require('dotenv').config()

const API_URL = process.env.API_URL;

class SyncVeda {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      const selectSrc = await this.getVendaSrc();
      const selectDest = await this.getVendaDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.numnota == itemUm.numnota &&
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

      console.log("Iniciando o sync das vendas");

      if (listInsert.length > 0) {
        await this.insertVenda(listInsert);
      }

      if (listUpdate.length > 0) {
        await this.updateVenda(listUpdate, selectDest);
      }

      console.log("Sincronização das vendas finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  async getVendaDest() {
    const response = await axios.get(`${API_URL}/vendas/select`);
    return response.data;
  }

  async getVendaSrc() {
    const response = await axios.get('url_api_venda');
    return response.data;
  }

  async insertVenda(listInsert) {
    for (const row of listInsert) {
      const dataInsert = {
        numnota: row.numnota,
        servend: row.servend,
        codfili: row.codfili,
        id_fili: row.id_fili,
        datvend: row.datvend,
        codparc: row.codparc,
        venvend: row.venvend,
        vlrliqu: row.vlrliqu,
        vlrnota: row.vlrnota,
        nomparc: row.nomparc,
        staorca: row.staorca,
        cidade: row.cidade,
        produtos: {},
        updated_at: row.updated_at,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${API_URL}/vendas/enviar`,
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

  async updateVenda(listUpdate, selectDest) {
    for (const row of listUpdate) {
      const itemAchado = selectDest.find(
        (itemDois) =>
          itemDois.numnota == row.numnota && itemDois.id_fili == row.id_fili
      );

      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${API_URL}/vendas/${itemAchado?.id}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          numnota: row.numnota,
          servend: row.servend,
          codfili: row.codfili,
          id_fili: row.id_fili,
          datvend: row.datvend,
          codparc: row.codparc,
          venvend: row.venvend,
          vlrliqu: row.vlrliqu,
          vlrnota: row.vlrnota,
          nomparc: row.nomparc,
          staorca: row.staorca,
          cidade: row.cidade,
          produtos: {},
          updated_at: row.updated_at,
        },
      };

      try {
        await axios(config);
        console.log(`Registro atualizado com sucesso: ${row.numnota}`);
      } catch (e) {
        console.error(`Erro ao atualizar registro: ${row.numnota}`);
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }
}

export default new SyncVeda();
